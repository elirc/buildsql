# d23 - Async and tasks drills

Eight problems on `Task` as a value: starting work before waiting for it, what
runs at the call and what waits, `WhenAny` and the loser, the failures
`await` does not show you, chaining steps, reading a task's state without
touching it, preferring the first success, and coalescing many callers onto one
piece of work. They drill lesson 13 - reread `13_async_await` if `await`
still feels like "make this synchronous".

Every task in this set is driven by a `TaskCompletionSource` the gate controls,
so nothing here depends on timing. Every file lives in
`src/Lessons/D23_AsyncTasks/`. Nothing here depends on anything else here.

## Exercise 1 - starting both before awaiting either

`Basics.BothAsync(first, second)` calls both factories *before* awaiting either
and returns `"<first>+<second>"` in parameter order.
`Basics.Immediate(value)` returns an already-completed task without being an
async method. `Basics.AlreadyFailed(message)` returns an already-faulted task
carrying an `InvalidOperationException` - returned, not thrown.

Edit `src/Lessons/D23_AsyncTasks/Ex1.cs`.

```
uv run dojo test csharp d23_async_tasks ex1
```

## Exercise 2 - what runs at the call, and what waits

`Timing.TraceAsync(gate, log)` adds `"before"`, awaits the gate, adds
`"after"`, and returns the log joined with `"|"`. The gate checks that
`"before"` is already there while the returned task is still pending.
`Timing.GreetAsync(name, ready)` returns `"hello ada"` once `ready` completes,
but throws `ArgumentException` **at the call** for an empty or null name.

Edit `src/Lessons/D23_AsyncTasks/Ex2.cs`.

```
uv run dojo test csharp d23_async_tasks ex2
```

## Exercise 3 - whoever gets there first

`Racing.FirstAsync(first, second)` returns the result of whichever finishes
first, leaving the other one untouched. `Racing.WinnerAsync(first, second)`
returns `"first"` or `"second"` naming which one it was.

Edit `src/Lessons/D23_AsyncTasks/Ex3.cs`.

```
uv run dojo test csharp d23_async_tasks ex3
```

## Exercise 4 - the failures await does not show you

`Failures.DescribeAsync(task)` returns `"ok:<result>"` or
`"failed:<message>"`, with the original exception's message.
`Failures.AllErrorsAsync(tasks)` waits for all of them and returns *every*
failure's message, in task order, comma-joined - an empty string when nothing
failed. Awaiting `Task.WhenAll` rethrows only the first.

Edit `src/Lessons/D23_AsyncTasks/Ex4.cs`.

```
uv run dojo test csharp d23_async_tasks ex4
```

## Exercise 5 - one step after another, without blocking

`Chaining.MapAsync(task, map)` applies a plain function to the task's result;
the function must not run before the task finishes.
`Chaining.ThenAsync(task, next)` runs a second asynchronous step on the first
one's result, starting it only when the first has finished - and not at all
when the first failed.

Edit `src/Lessons/D23_AsyncTasks/Ex5.cs`.

```
uv run dojo test csharp d23_async_tasks ex5
```

## Exercise 6 - asking a task how it is doing

`States.Describe(task)` returns `"pending"`, `"ok"`, `"cancelled"` or
`"faulted:<message>"` without awaiting or blocking.
`States.ResultOrFallback(task, fallback)` returns the result only when the task
has already succeeded, and the fallback in every other case - never awaiting,
never blocking, never throwing.

Edit `src/Lessons/D23_AsyncTasks/Ex6.cs`.

```
uv run dojo test csharp d23_async_tasks ex6
```

## Exercise 7 - the first one that actually works

`Preference.FirstSuccessfulAsync(tasks)` returns the result of the first task
to finish *successfully*, ignoring the ones that fail and carrying on waiting.
When every task has failed it throws an `AggregateException` holding all of
their exceptions in task order. An empty sequence is an `ArgumentException`.

Edit `src/Lessons/D23_AsyncTasks/Ex7.cs`.

```
uv run dojo test csharp d23_async_tasks ex7
```

## Exercise 8 - one piece of work, however many askers

`AsyncOnce<T>` calls its factory at most once and hands every caller the same
`Task` object, so callers arriving while the work is still running do not start
their own. `FactoryCalls` counts the calls. A factory whose task *fails* is not
cached: the next caller tries again.

Edit `src/Lessons/D23_AsyncTasks/Ex8.cs`.

```
uv run dojo test csharp d23_async_tasks ex8
```

## The gate

This is the entire gate class, `tests/Gates/D23_AsyncTasksTests.cs`:

```csharp
using CSharpDojo.D23_AsyncTasks;

namespace CSharpDojo.Gates;

public class D23_AsyncTasksTests
{
    private static Task<string> Failed(string message)
    {
        return Task.FromException<string>(new InvalidOperationException(message));
    }

    [Fact]
    public async Task Ex1_StartingBothBeforeAwaitingEither()
    {
        TaskCompletionSource<string> left = new TaskCompletionSource<string>();
        TaskCompletionSource<string> right = new TaskCompletionSource<string>();
        List<string> started = new List<string>();

        Task<string> both = Basics.BothAsync(
            () =>
            {
                started.Add("left");
                return left.Task;
            },
            () =>
            {
                started.Add("right");
                return right.Task;
            });

        Teach.Equal("left|right", string.Join("|", started),
            "BOTH operations must have been started before the method waits for either. If only "
                + "\"left\" is here, you awaited the first call before making the second, which "
                + "turns two concurrent operations into two sequential ones - reread README ex1.");
        Teach.True(!both.IsCompleted, "Neither has produced a value yet, so there is no answer.");

        right.SetResult("b");
        Teach.True(!both.IsCompleted, "One of the two is in. Still not enough.");

        left.SetResult("a");
        Teach.Equal("a+b", await both,
            "The output order comes from the PARAMETERS, not from who finished first - reread "
                + "README ex1.");

        Task<string> ready = Basics.Immediate("done");
        Teach.True(ready.IsCompletedSuccessfully,
            "Task.FromResult hands back a task that is finished before anybody looks at it - no "
                + "async machinery and no thread involved - reread README ex1.");
        Teach.Equal("done", await ready, "...carrying the value.");

        Task<string> broken = Basics.AlreadyFailed("nope");
        Teach.True(broken.IsFaulted,
            "Task.FromException produces a task that is already failed. The method RETURNED it "
                + "rather than throwing, which is what lets a caller who is holding a Task find "
                + "out about it in the usual way - reread README ex1.");
        InvalidOperationException failure = await Teach.ThrowsAsync<InvalidOperationException>(
            () => broken, "Awaiting it rethrows the original exception...");
        Teach.Equal("nope", failure.Message, "...with its own message.");
    }

    [Fact]
    public async Task Ex2_WhatRunsAtTheCallAndWhatWaits()
    {
        TaskCompletionSource gate = new TaskCompletionSource();
        List<string> log = new List<string>();

        Task<string> trace = Timing.TraceAsync(gate.Task, log);

        Teach.Equal("before", string.Join("|", log),
            "Everything up to the FIRST await ran while the caller was still inside the call: an "
                + "async method starts running synchronously and only returns a task when it "
                + "reaches something it has to wait for - reread README ex2.");
        Teach.True(!trace.IsCompleted, "...and then it stopped there.");

        gate.SetResult();
        Teach.Equal("before|after", await trace, "The rest runs once the awaited task finishes.");

        TaskCompletionSource ready = new TaskCompletionSource();
        Task<string> greeting = Timing.GreetAsync("ada", ready.Task);
        Teach.True(!greeting.IsCompleted, "The greeting waits for the ready signal.");
        ready.SetResult();
        Teach.Equal("hello ada", await greeting, "...and then produces its text.");

        Teach.Throws<ArgumentException>(
            () => Timing.GreetAsync("", new TaskCompletionSource().Task),
            "An empty name is a caller mistake, and it must be thrown AT THE CALL rather than "
                + "buried in a returned task. In a plain `async` method it would go into the "
                + "task instead, so the validation has to live in a non-async wrapper around an "
                + "async local function - reread README ex2.");

        Teach.Throws<ArgumentException>(
            () => Timing.GreetAsync(null!, new TaskCompletionSource().Task),
            "...and null is the same mistake.");
    }

    [Fact]
    public async Task Ex3_WhoeverGetsThereFirst()
    {
        TaskCompletionSource<string> slow = new TaskCompletionSource<string>();
        TaskCompletionSource<string> quick = new TaskCompletionSource<string>();

        Task<string> race = Racing.FirstAsync(slow.Task, quick.Task);
        Teach.True(!race.IsCompleted, "Neither has finished.");

        quick.SetResult("q");
        Teach.Equal("q", await race,
            "WhenAny completes as soon as one of them does, and the result is the winner's - "
                + "reread README ex3.");
        Teach.True(!slow.Task.IsCompleted,
            "...and the loser is still exactly where it was: pending. WhenAny does not cancel "
                + "anything, and the work it started carries on - reread README ex3.");

        TaskCompletionSource<string> a = new TaskCompletionSource<string>();
        TaskCompletionSource<string> b = new TaskCompletionSource<string>();
        Task<string> whoWon = Racing.WinnerAsync(a.Task, b.Task);
        b.SetResult("b");
        Teach.Equal("second", await whoWon,
            "WhenAny hands back the TASK that finished, so comparing it with the parameters is "
                + "how you know which one it was - reread README ex3.");

        TaskCompletionSource<string> c = new TaskCompletionSource<string>();
        TaskCompletionSource<string> d = new TaskCompletionSource<string>();
        Task<string> otherWay = Racing.WinnerAsync(c.Task, d.Task);
        c.SetResult("c");
        Teach.Equal("first", await otherWay, "...and the other way round.");

        Task<string> alreadyDone = Racing.FirstAsync(Task.FromResult("instant"), new TaskCompletionSource<string>().Task);
        Teach.Equal("instant", await alreadyDone, "A task that is already finished wins at once.");

        Task<string> loser = new TaskCompletionSource<string>().Task;
        await Teach.ThrowsAsync<InvalidOperationException>(
            () => Racing.FirstAsync(Failed("winner failed"), loser),
            "The first task to finish is the one you get, even when it finished by failing - "
                + "awaiting the winner rethrows it - reread README ex3.");
    }

    [Fact]
    public async Task Ex4_TheFailuresAwaitDoesNotShowYou()
    {
        Teach.Equal("ok:value", await Failures.DescribeAsync(Task.FromResult("value")),
            "A task that succeeded - reread README ex4.");

        Teach.Equal("failed:boom", await Failures.DescribeAsync(Failed("boom")),
            "...and one that did not. The message is the ORIGINAL exception's: await unwraps the "
                + "AggregateException that Task.Result would have handed you - reread README ex4.");

        Teach.Equal(
            string.Empty,
            await Failures.AllErrorsAsync(new[] { Task.FromResult("a"), Task.FromResult("b") }),
            "Nothing failed, so there is nothing to report - reread README ex4.");

        Teach.Equal(
            "first,third",
            await Failures.AllErrorsAsync(new[]
            {
                Failed("first"),
                Task.FromResult("fine"),
                Failed("third"),
            }),
            "Awaiting Task.WhenAll rethrows only the FIRST failure, so a plain try/catch around "
                + "it would report \"first\" and silently lose \"third\". Every failure is still "
                + "sitting on its own task - reread README ex4.");

        Teach.Equal(
            "only",
            await Failures.AllErrorsAsync(new[] { Failed("only") }),
            "One failure is still a list of one.");

        Teach.Equal(
            string.Empty,
            await Failures.AllErrorsAsync(Array.Empty<Task<string>>()),
            "No tasks at all completes immediately with nothing to say.");

        TaskCompletionSource<string> pending = new TaskCompletionSource<string>();
        Task<string> waiting = Failures.AllErrorsAsync(new[] { Failed("early"), pending.Task });
        Teach.True(!waiting.IsCompleted,
            "One task has already failed, but WhenAll waits for ALL of them - it does not stop at "
                + "the first failure - reread README ex4.");
        pending.SetResult("late");
        Teach.Equal("early", await waiting, "...and then reports what went wrong.");
    }

    [Fact]
    public async Task Ex5_OneStepAfterAnotherWithoutBlocking()
    {
        TaskCompletionSource<int> source = new TaskCompletionSource<int>();
        int mapCalls = 0;

        Task<string> mapped = Chaining.MapAsync(source.Task, value =>
        {
            mapCalls++;
            return $"n={value}";
        });

        Teach.Equal(0, mapCalls,
            "The function must not run before there is a value to give it - reread README ex5.");
        Teach.True(!mapped.IsCompleted, "...so the result is not ready either.");

        source.SetResult(7);
        Teach.Equal("n=7", await mapped, "Once the task finishes, the function runs on its result.");
        Teach.Equal(1, mapCalls, "...exactly once.");

        TaskCompletionSource<int> firstStep = new TaskCompletionSource<int>();
        TaskCompletionSource<string> secondStep = new TaskCompletionSource<string>();
        int nextCalls = 0;

        Task<string> chained = Chaining.ThenAsync(firstStep.Task, value =>
        {
            nextCalls++;
            return secondStep.Task;
        });

        Teach.Equal(0, nextCalls,
            "The second step is not even STARTED until the first has finished - reread README ex5.");

        firstStep.SetResult(1);
        await Task.Yield();
        Teach.Equal(1, nextCalls, "...and then it is.");
        Teach.True(!chained.IsCompleted, "...but its own task is still running.");

        secondStep.SetResult("finished");
        Teach.Equal("finished", await chained, "...until it is not.");

        int skipped = 0;
        await Teach.ThrowsAsync<InvalidOperationException>(
            () => Chaining.ThenAsync(
                Task.FromException<int>(new InvalidOperationException("step one")),
                value =>
                {
                    skipped++;
                    return Task.FromResult("never");
                }),
            "A failure in the first step comes straight out - reread README ex5.");
        Teach.Equal(0, skipped,
            "...and the second step never ran. `await` on the first line is what makes that "
                + "automatic - reread README ex5.");
    }

    [Fact]
    public void Ex6_AskingATaskHowItIsDoing()
    {
        TaskCompletionSource<string> pending = new TaskCompletionSource<string>();
        Teach.Equal("pending", States.Describe(pending.Task),
            "Nothing has happened yet, and asking must not make it happen - reread README ex6.");

        Teach.Equal("ok", States.Describe(Task.FromResult("value")), "A finished task.");

        Teach.Equal("faulted:boom", States.Describe(Failed("boom")),
            "A failed task holds an AggregateException, and the message worth showing is the one "
                + "INSIDE it - reread README ex6.");

        TaskCompletionSource<string> cancelled = new TaskCompletionSource<string>();
        cancelled.SetCanceled();
        Teach.Equal("cancelled", States.Describe(cancelled.Task),
            "Cancelled is its own state, not a kind of failure - and IsFaulted is false for it, "
                + "so the order of your checks matters - reread README ex6.");

        Teach.Equal("value", States.ResultOrFallback(Task.FromResult("value"), "none"),
            "A successful task's result is safe to read directly - reread README ex6.");
        Teach.Equal("none", States.ResultOrFallback(pending.Task, "none"),
            "A pending one gives the fallback. Reading .Result here would have BLOCKED the "
                + "thread until somebody completed the task, which in a real application is how "
                + "you deadlock - reread README ex6.");
        Teach.Equal("none", States.ResultOrFallback(Failed("boom"), "none"),
            "A failed one gives the fallback too, rather than throwing - reread README ex6.");
        Teach.Equal("none", States.ResultOrFallback(cancelled.Task, "none"),
            "...and so does a cancelled one. IsCompletedSuccessfully is the single test that "
                + "excludes all three - reread README ex6.");
    }

    [Fact]
    public async Task Ex7_TheFirstOneThatActuallyWorks()
    {
        TaskCompletionSource<string> slow = new TaskCompletionSource<string>();
        Task<string> winner = Preference.FirstSuccessfulAsync(new[] { Task.FromResult("fast"), slow.Task });
        Teach.Equal("fast", await winner, "The one that had already finished - reread README ex7.");

        TaskCompletionSource<string> good = new TaskCompletionSource<string>();
        Task<string> ignoringFailures = Preference.FirstSuccessfulAsync(new[] { Failed("down"), good.Task });
        Teach.True(!ignoringFailures.IsCompleted,
            "The first task finished, but by FAILING - so the wait carries on rather than ending "
                + "there. A plain WhenAny would have stopped and rethrown - reread README ex7.");
        good.SetResult("worked");
        Teach.Equal("worked", await ignoringFailures, "...and the good one is the answer.");

        TaskCompletionSource<string> late = new TaskCompletionSource<string>();
        Task<string> twoFailures = Preference.FirstSuccessfulAsync(new[] { Failed("a"), Failed("b"), late.Task });
        Teach.True(!twoFailures.IsCompleted, "Two failures are not enough to give up while one is left.");
        late.SetResult("last");
        Teach.Equal("last", await twoFailures, "...and the survivor wins.");

        AggregateException allFailed = await Teach.ThrowsAsync<AggregateException>(
            () => Preference.FirstSuccessfulAsync(new[] { Failed("one"), Failed("two") }),
            "When there is nothing left to wait for, every task has failed and the caller needs "
                + "all of the reasons - reread README ex7.");
        Teach.Equal("one,two", string.Join(",", allFailed.InnerExceptions.Select(inner => inner.Message)),
            "...in task order, not in the order they happened to finish - reread README ex7.");

        await Teach.ThrowsAsync<ArgumentException>(
            () => Preference.FirstSuccessfulAsync(Array.Empty<Task<string>>()),
            "No tasks at all cannot produce a result and is a caller mistake, not an empty "
                + "answer - reread README ex7.");
    }

    [Fact]
    public async Task Ex8_OnePieceOfWorkHoweverManyAskers()
    {
        TaskCompletionSource<string> work = new TaskCompletionSource<string>();
        AsyncOnce<string> once = new AsyncOnce<string>(() => work.Task);

        Teach.Equal(0, once.FactoryCalls,
            "Constructing the wrapper must not start anything - reread README ex8.");

        Task<string> a = once.GetAsync();
        Task<string> b = once.GetAsync();
        Task<string> c = once.GetAsync();

        Teach.Equal(1, once.FactoryCalls,
            "Three callers arrived while the work was still running, and the factory ran ONCE. "
                + "That is the whole purpose: a cache that only coalesces after the work finishes "
                + "still lets a stampede through - reread README ex8.");
        Teach.True(ReferenceEquals(a, b) && ReferenceEquals(b, c),
            "...and all three got the very same Task object back - reread README ex8.");

        work.SetResult("value");
        Teach.Equal("value", await a, "Everyone waiting on it gets the answer...");
        Teach.Equal("value", await b, "...the same answer...");
        Teach.Equal("value", await once.GetAsync(), "...and so does somebody who arrives later.");
        Teach.Equal(1, once.FactoryCalls,
            "...still one call. The finished task is kept, so a later caller does no work at "
                + "all - reread README ex8.");

        int attempts = 0;
        TaskCompletionSource<string> retryable = new TaskCompletionSource<string>();
        AsyncOnce<string> retrying = new AsyncOnce<string>(() =>
        {
            attempts++;
            return attempts == 1
                ? Task.FromException<string>(new InvalidOperationException("first try failed"))
                : retryable.Task;
        });

        await Teach.ThrowsAsync<InvalidOperationException>(
            () => retrying.GetAsync(), "The first attempt fails - reread README ex8.");
        Teach.Equal(1, retrying.FactoryCalls, "...having called the factory once.");

        Task<string> second = retrying.GetAsync();
        Teach.Equal(2, retrying.FactoryCalls,
            "A FAILED task must not be cached: caching it would mean one unlucky moment poisons "
                + "the value for the lifetime of the process - reread README ex8.");
        retryable.SetResult("worked");
        Teach.Equal("worked", await second, "...and the retry succeeds.");
        Teach.Equal(2, retrying.FactoryCalls, "...and is then cached like any other success.");
    }
}
```
