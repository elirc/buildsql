# 13 — async and await

A web server handling a thousand requests spends almost all of its time waiting
— for a database, for an HTTP call, for a disk. If each of those waits occupies
a thread, a thousand concurrent requests need a thousand threads, each with a
megabyte of stack, most of them asleep. `async`/`await` exists to make waiting
free: the method gives its thread back while it waits, and picks up where it
left off when the answer arrives.

The mental model that gets people through: **`await` does not run anything in
parallel.** It says "this result is not here yet; suspend me, and resume this
method when it is". Whether the work happens on another thread, on the network,
or on a disk controller is not `await`'s business. Concurrency is what
`Task.WhenAll` adds, and starting work in the background is what `Task.Run`
does — three different ideas that get merged into one under the name "async" in
conversation, and separating them is most of what an interviewer is checking.

Everything in this lesson's gates is deterministic: no `Task.Delay`, no
sleeping, no "usually finishes in time". The tasks are controlled by
`TaskCompletionSource`, so the gate decides exactly when each one completes.
That is also how you should write async tests of your own.

## Concept — tasks, awaiting, and the three ways to get it wrong

A `Task<T>` is a promise of a `T` that may not have arrived yet. An `async`
method returns one:

```csharp
public static async Task<int> LoadAsync(HttpClient client)
{
    string body = await client.GetStringAsync("https://example.com");  // suspends here
    return body.Length;                                                 // resumes here
}
```

`await` unwraps the result, and rethrows the original exception if the task
failed.

**Waiting for several things.** Awaiting in sequence takes as long as the sum;
`Task.WhenAll` takes as long as the slowest:

```csharp
int[] results = await Task.WhenAll(first, second);   // results are in INPUT order
```

That input-order guarantee matters: however the tasks finish, the array lines up
with the tasks you passed.

**Cancellation is cooperative.** A `CancellationToken` is a signal, not a
weapon. Nothing can abort running code from outside; code that wants to be
cancellable must check:

```csharp
token.ThrowIfCancellationRequested();       // between steps you control
await work.WaitAsync(token);                // stop waiting for something you don't
```

Both throw `OperationCanceledException`, which by convention is *not* an error
to log — it is the answer to "did the caller change their mind?".

**The three classic mistakes**, all of which this lesson makes you see:

1. **`.Result` / `.Wait()`** — blocks the thread instead of yielding it, and
   wraps any failure in an `AggregateException`. In an app with a
   synchronization context (WinForms, WPF, old ASP.NET), it deadlocks outright:
   the continuation needs the thread that is sitting there blocking on it.
2. **`async void`** — a method returning `void` has no task, so nobody can await
   it and nobody can catch its exceptions; they go straight to the
   synchronization context and usually take the process down. The only
   legitimate use is an event handler.
3. **Not passing the token down** — a cancellation chain works only if every
   link forwards it.

## Exercise 1 — awaiting two things

Edit `src/Lessons/L13_AsyncAwait/Ex1.cs`. `SumAsync(first, second)` returns the
two results added together. `InOrderAsync(first, second)` returns
`"one+two"` — the results in **parameter** order, however the tasks actually
finish.

The gate hands you tasks it controls and completes them in the wrong order on
purpose, checking along the way that your returned task is not finished before
both inputs are.

```
uv run dojo test csharp 13_async_await ex1
```

## Exercise 2 — fanning out

Edit `src/Lessons/L13_AsyncAwait/Ex2.cs`. `SumAllAsync` totals a sequence of
tasks. `JoinAsync` joins their results with `", "` — again in the order the
tasks were given, not the order they completed.

The gate finishes three tasks in exactly reverse order and expects the original
order back. That property of `Task.WhenAll` is worth knowing precisely: the
results array is positional.

```
uv run dojo test csharp 13_async_await ex2
```

## Exercise 3 — cancellation

Edit `src/Lessons/L13_AsyncAwait/Ex3.cs`. `WaitOrCancelAsync(work, token)`
returns the work's result, unless the token fires first — in which case an
`OperationCanceledException` comes out. `SumUntilCancelledAsync(tasks, token)`
adds up the results, checking the token before each one so an already-cancelled
request does no work at all.

Read the gate's assertion after the cancellation: the underlying task is *still
pending*. Cancelling a wait does not stop the work. That is the single most
important thing to understand about cancellation in .NET.

```
uv run dojo test csharp 13_async_await ex3
```

## Exercise 4 — fix this code

Edit `src/Lessons/L13_AsyncAwait/Ex4.cs`. `RunAsync(work)` returns the work's
result, and when the work has failed the caller must see the **original**
exception — not an `AggregateException` with it buried inside. That difference
is exactly what `.Result` gets wrong and `await` gets right, and the gate can
tell them apart.

`AlwaysFailsAsync()` throws an `InvalidOperationException` with the message
`"boom"` — but the failure must arrive **in the returned task**, not be thrown
at the caller before they have a task to await.

```
uv run dojo test csharp 13_async_await ex4
```

## Challenge — fan out, wait, and describe what happened

Edit `src/Lessons/L13_AsyncAwait/Challenge.cs`. `SummariseAsync(work, token)`
waits for every task and reports `"ok: <total>"` when all succeeded, or
`"failed: <exception type name>"` naming the first faulted task in list order —
and lets an `OperationCanceledException` straight out when the token fires.

Honest difficulty note: the catch-block ordering is the difficulty. A bare
`catch` written first swallows the cancellation and reports it as a failure,
and the gate checks for exactly that. Finding *which* task failed also needs a
look at the tasks themselves, because awaiting `WhenAll` only rethrows one of
the exceptions. Finish it with a `switch` expression over the exception type if
you like — a fitting last line for the language part of this course.

```
uv run dojo test csharp 13_async_await challenge
```

## The gate

This is the entire gate class, `tests/Gates/L13_AsyncAwaitTests.cs`:

```csharp
using CSharpDojo.L13_AsyncAwait;

namespace CSharpDojo.Gates;

public class L13_AsyncAwaitTests
{
    [Fact]
    public async Task Ex1_AwaitBothBeforeYouAnswer()
    {
        TaskCompletionSource<int> first = new TaskCompletionSource<int>();
        TaskCompletionSource<int> second = new TaskCompletionSource<int>();

        Task<int> sum = Awaiting.SumAsync(first.Task, second.Task);

        Teach.True(!sum.IsCompleted,
            "Neither input has produced a value yet, so the result cannot be finished. If this "
                + "failed, you returned something without awaiting - reread README ex1.");

        second.SetResult(3);
        Teach.True(!sum.IsCompleted,
            "One of the two is in. Still not enough - reread README ex1.");

        first.SetResult(2);
        Teach.Equal(5, await sum, "2 + 3, whichever order they arrived in.");

        TaskCompletionSource<string> left = new TaskCompletionSource<string>();
        TaskCompletionSource<string> right = new TaskCompletionSource<string>();
        Task<string> joined = Awaiting.InOrderAsync(left.Task, right.Task);

        right.SetResult("two");
        left.SetResult("one");

        Teach.Equal("one+two", await joined,
            "The SECOND task finished first, and the answer still reads \"one+two\": the "
                + "output order comes from the parameters, not from who won - reread README ex1.");
    }

    [Fact]
    public async Task Ex2_WhenAllKeepsTheInputOrder()
    {
        TaskCompletionSource<int> a = new TaskCompletionSource<int>();
        TaskCompletionSource<int> b = new TaskCompletionSource<int>();
        TaskCompletionSource<int> c = new TaskCompletionSource<int>();

        Task<int> total = Fanout.SumAllAsync(new[] { a.Task, b.Task, c.Task });

        c.SetResult(3);
        a.SetResult(1);
        Teach.True(!total.IsCompleted, "Two of three: WhenAll waits for every one of them - "
            + "reread README ex2.");

        b.SetResult(2);
        Teach.Equal(6, await total, "1 + 2 + 3.");

        TaskCompletionSource<string> x = new TaskCompletionSource<string>();
        TaskCompletionSource<string> y = new TaskCompletionSource<string>();
        TaskCompletionSource<string> z = new TaskCompletionSource<string>();

        Task<string> joined = Fanout.JoinAsync(new[] { x.Task, y.Task, z.Task });

        z.SetResult("zebra");
        y.SetResult("yak");
        x.SetResult("xerus");

        Teach.Equal("xerus, yak, zebra", await joined,
            "They finished in exactly the reverse order, and the answer is still in input "
                + "order: Task.WhenAll's result array lines up with the tasks you gave it - "
                + "reread README ex2.");

        Teach.Equal(0, await Fanout.SumAllAsync(Array.Empty<Task<int>>()),
            "WhenAll over nothing completes immediately, and the sum of nothing is 0.");
    }

    [Fact]
    public async Task Ex3_CancellationStopsTheWaitingNotTheWork()
    {
        Teach.Equal(7, await Cancellable.WaitOrCancelAsync(Task.FromResult(7), CancellationToken.None),
            "With nothing cancelled, this is just an await - reread README ex3.");

        TaskCompletionSource<int> never = new TaskCompletionSource<int>();
        CancellationTokenSource source = new CancellationTokenSource();
        Task<int> pending = Cancellable.WaitOrCancelAsync(never.Task, source.Token);

        Teach.True(!pending.IsCompleted, "Nothing has happened yet - the work is still running "
            + "and nobody has cancelled.");

        source.Cancel();

        await Teach.ThrowsAsync<OperationCanceledException>(
            () => pending,
            "Once the token is cancelled, the wait must end with an OperationCanceledException "
                + "- Task.WaitAsync(token) does exactly this - reread README ex3. Note the "
                + "work itself is still running: cancelling a wait cannot un-start a task.");

        Teach.True(!never.Task.IsCompleted,
            "...and there is the proof: the underlying task is still pending.");

        Teach.Equal(6, await Cancellable.SumUntilCancelledAsync(
                new[] { Task.FromResult(1), Task.FromResult(2), Task.FromResult(3) },
                CancellationToken.None),
            "No cancellation, so every task contributes - reread README ex3.");

        CancellationTokenSource cancelled = new CancellationTokenSource();
        cancelled.Cancel();

        await Teach.ThrowsAsync<OperationCanceledException>(
            () => Cancellable.SumUntilCancelledAsync(new[] { Task.FromResult(1) }, cancelled.Token),
            "An ALREADY cancelled token means do no work at all: check it at the top of the "
                + "loop with token.ThrowIfCancellationRequested() - reread README ex3.");
    }

    [Fact]
    public async Task Ex4_AwaitUnwrapsWhatResultWrapsUp()
    {
        Teach.Equal(41, await Faults.RunAsync(Task.FromResult(41)), "The ordinary path.");

        TaskCompletionSource<int> broken = new TaskCompletionSource<int>();
        broken.SetException(new InvalidOperationException("inner boom"));

        InvalidOperationException caught = await Teach.ThrowsAsync<InvalidOperationException>(
            () => Faults.RunAsync(broken.Task),
            "await rethrows the ORIGINAL exception. Blocking on .Result or .Wait() instead "
                + "throws an AggregateException with the real one buried inside - which is why "
                + "this gate can tell the two apart - reread README ex4.");

        Teach.Equal("inner boom", caught.Message, "...and it is the same exception object, "
            + "message and all.");

        Task<int> failing = Faults.AlwaysFailsAsync();

        Teach.True(failing.IsFaulted || !failing.IsCompleted,
            "Calling AlwaysFailsAsync must RETURN a task carrying the failure, not throw in "
                + "the caller's face. If the exception escaped at the call site this line "
                + "never even ran - which means the method is not `async` - reread README ex4.");

        InvalidOperationException later = await Teach.ThrowsAsync<InvalidOperationException>(
            () => failing,
            "The failure surfaces when the task is awaited.");

        Teach.Equal("boom", later.Message, "With the message the prompt asked for.");
    }

    [Fact]
    public async Task Challenge_SummariseReportsSuccessFailureAndCancellation()
    {
        TaskCompletionSource<int> a = new TaskCompletionSource<int>();
        TaskCompletionSource<int> b = new TaskCompletionSource<int>();
        Task<string> ok = Pipeline.SummariseAsync(
            new[] { a.Task, b.Task }, CancellationToken.None);

        a.SetResult(4);
        b.SetResult(5);
        Teach.Equal("ok: 9", await ok, "Everything succeeded, so report the total - reread "
            + "README challenge.");

        TaskCompletionSource<int> good = new TaskCompletionSource<int>();
        TaskCompletionSource<int> bad = new TaskCompletionSource<int>();
        Task<string> failed = Pipeline.SummariseAsync(
            new[] { good.Task, bad.Task }, CancellationToken.None);

        good.SetResult(1);
        bad.SetException(new TimeoutException("too slow"));

        Teach.Equal("failed: TimeoutException", await failed,
            "One task faulted, so report its exception type. Task.WhenAll waits for ALL of "
                + "them even after one fails, and its awaited exception is the first one - "
                + "reread README challenge.");

        TaskCompletionSource<int> pendingWork = new TaskCompletionSource<int>();
        CancellationTokenSource source = new CancellationTokenSource();
        Task<string> cancelled = Pipeline.SummariseAsync(new[] { pendingWork.Task }, source.Token);

        Teach.True(!cancelled.IsCompleted, "Nothing has finished and nothing is cancelled yet.");

        source.Cancel();

        await Teach.ThrowsAsync<OperationCanceledException>(
            () => cancelled,
            "Cancellation is not a failure to report - it travels out as an "
                + "OperationCanceledException. A bare `catch` that swallows it and returns "
                + "\"failed: ...\" is the bug this check exists to catch - reread README "
                + "challenge.");
    }
}
```

In plain English: every gate here drives `TaskCompletionSource` objects, so
nothing depends on timing. `Ex1` completes two tasks in reverse order, checking
in between that your result is still pending. `Ex2` does the same with three.
`Ex3` cancels a wait and then proves the work is still running, and calls the
second method with an already-cancelled token. `Ex4` awaits a faulted task and
insists on the original exception type and message. `Challenge` runs the three
outcomes: all-succeed, one-faults, and cancelled-while-waiting.

## The teaching point

Two rules cover most async code you will write:

**Async all the way down.** If a method awaits, it returns a `Task`, and its
caller awaits it too — up to a boundary the framework owns (a controller
action, a `BackgroundService`, `Main`). The moment somebody blocks with
`.Result` in the middle, you have given away the benefit and possibly bought a
deadlock.

**Pass the token.** Every async API takes a `CancellationToken` as its last
parameter for a reason: cancellation only works if every layer forwards it. A
method that accepts one and quietly ignores it is worse than one that never
took it, because the caller believes it works.

And the honest limitation, which is the answer to the most common follow-up
question: async is about **not blocking a thread while waiting**, not about
going faster. It makes a server handle more concurrent requests with fewer
threads. It does nothing at all for CPU-bound work — that is what
`Task.Run` and `Parallel.For` are for, and reaching for `async` there is a
common and revealing mistake.

That is the end of the language part of the course. Next: **i1_interview_concepts**,
where everything you have built gets turned into answers you can say out loud.
