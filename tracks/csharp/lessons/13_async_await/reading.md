# Reading - csharp/13_async_await

## Notes

**What the compiler actually does.** An `async` method is rewritten into a state
machine, exactly like the iterators in lesson 08. Each `await` becomes: check
whether the awaited thing is already complete; if it is, carry straight on; if
it is not, register a continuation and **return** to the caller. The method's
locals become fields on the state machine object so they survive the gap. The
task you hand back is that state machine's promise. Two things follow: the code
before the first `await` runs *synchronously* on the calling thread, and there
is no thread sitting anywhere waiting for the result.

**Async is not a thread.** The most useful sentence about async I/O: while a
network read is in flight there is **no thread involved at all** — the operating
system holds the request and signals a completion port when data arrives. That
is why a server can have ten thousand pending requests and twenty threads. It is
also why `async` does nothing for CPU-bound work: burning CPU genuinely needs a
thread, and `Task.Run` is the tool for pushing that off the current one.

**The synchronization context, and where deadlocks come from.** In WinForms,
WPF and old ASP.NET, `await` captures a context and resumes the continuation on
it — the UI thread, or the request's thread. Now block that same thread with
`.Result` and the continuation can never run: the thread is waiting for a task
whose continuation needs the thread. Classic deadlock, and the reason
`ConfigureAwait(false)` exists — it says "resume anywhere, I do not need the
context". Modern ASP.NET Core has no synchronization context, so the deadlock
does not occur there, but library code still uses `ConfigureAwait(false)`
because it cannot know who will call it. In application code you generally do
not need it.

**`async void` is a trap with one legitimate use.** A `void`-returning async
method hands the caller nothing to await, so nobody can wait for it and nobody
can catch its exceptions — they are raised on the synchronization context and
usually terminate the process. The single legitimate case is an event handler,
because the event's delegate signature demands `void`. Everywhere else: return
`Task`.

**`ValueTask`, briefly.** A `Task` is a heap allocation, which matters when a
method is called millions of times and usually completes synchronously (a cache
hit, a buffered read). `ValueTask<T>` avoids the allocation in that case, at the
cost of stricter rules — you may await it only once, and never block on it. Use
`Task` by default; recognise `ValueTask` when you see it in high-performance
APIs.

## ex1

The gate's shape — assert "not completed", complete one input, assert "still not
completed", complete the other — is worth stealing for your own async tests.
`TaskCompletionSource` gives you a task whose completion *you* trigger, which
removes timing from the test entirely. Tests that call `Task.Delay(100)` and
hope are the reason people believe async tests are flaky.

The sequential-versus-concurrent point is the one to keep. `await first; await second;`
gives the same answer as `Task.WhenAll` here, because both tasks were already
running before your method was called. Change that to a method that *starts*
each call — `await LoadAsync(a); await LoadAsync(b);` — and the two versions
differ by the duration of the first call, every time. The rule of thumb: start
everything you can, then await; do not start-and-await in a loop unless the
calls genuinely depend on each other.

Reading `.Result` on an already-completed task, as `InOrderAsync` may do after
`WhenAll`, is safe and non-blocking. It is still a habit worth avoiding, because
the same expression a hundred lines later, on a task that has not completed, is
a blocked thread — and reviewers cannot tell the two apart at a glance.

## ex2

`Task.WhenAll`'s positional result array is a small guarantee with large
consequences: you can fan out over a list of ids and zip the results back
against it, with no correlation logic at all. Completion order tells you nothing
and you never need it.

Two behaviours worth knowing. If several tasks fault, awaiting `WhenAll` rethrows
only the **first** exception — the rest are still there on the task's
`AggregateException`, reachable through `task.Exception.InnerExceptions`, which
is what the challenge digs into. And `WhenAll` waits for *every* task even after
one has failed, which is usually right (no orphaned work continuing in the
background) and occasionally not.

The lazy-sequence trap deserves repeating because it combines two lessons.
`items.Select(i => FetchAsync(i))` is a lazy query whose *enumeration* starts the
tasks. Pass it to `WhenAll` and it is enumerated once, fine. Enumerate it twice —
`if (queries.Any())` and then `await Task.WhenAll(queries)` — and you have
started every request twice. `.ToList()` before you hand it over.

## ex3

Cancellation in .NET is cooperative and that is a design decision, not a
limitation. The alternative — killing a thread mid-operation — leaves locks
held, files half-written and invariants broken, which is why `Thread.Abort` was
deprecated and then removed. So a `CancellationToken` is a flag with a callback
list, and code that wants to be interruptible has to look at it.

The two idioms cover the two situations. When you control the loop, check
between steps with `ThrowIfCancellationRequested()`. When you are waiting for
somebody else's task, `WaitAsync(token)` stops the *wait* — and, as the gate
proves, the work carries on regardless. That distinction is the interview
question: "how do you cancel a task?" The answer is that you do not cancel a
task, you signal an intent, and the task decides.

`OperationCanceledException` gets special treatment across the framework: a task
that ends with one is `TaskStatus.Canceled` rather than `Faulted`, and ASP.NET
Core does not log it as an error, because a client hanging up is not a bug. That
is also why catching it and returning a "failed" result is wrong — it turns a
non-event into an alert.

`TaskCanceledException` derives from `OperationCanceledException`, so catch the
base and stop worrying about which one you got.

## ex4

Two mistakes in one exercise, and both are [***] interview questions.

**`.Result` versus `await`.** Blocking on a task wraps whatever went wrong in an
`AggregateException`, because a task can hold several exceptions. `await`
unwraps and rethrows the first one with its stack trace preserved (via
`ExceptionDispatchInfo`), so your `catch (InvalidOperationException)` actually
catches. The gate distinguishes them by asserting the exception *type*, which is
the cleanest possible demonstration.

The other half of `.Result` is worse: it blocks a thread. On a server that is a
thread not serving a request; under a synchronization context it is the deadlock
described above. `GetAwaiter().GetResult()` at least avoids the wrapping, which
is why you see it in `Main` methods of older code, but it still blocks.

**Where an async method's exception lives.** Because the method body runs inside
a state machine, a `throw` anywhere in it is captured and placed on the returned
task. So `var t = FailsAsync();` does not throw — `await t` does. A
*non*-async method declared to return `Task` that throws directly does throw at
the call site, which is a genuine difference in behaviour and the reason the
guidance for argument validation is to do it in a small non-async wrapper that
returns the async part:

```csharp
public static Task<int> LoadAsync(string path)
{
    ArgumentException.ThrowIfNullOrEmpty(path);   // eagerly, at the call site
    return LoadCoreAsync(path);                    // the async part
}
```

## challenge

The catch-ordering trap is real and appears in production code constantly. A
`catch (Exception)` around an awaited operation catches `OperationCanceledException`
too, so a cancelled request gets logged as an error, alerts fire, and somebody
investigates a user who closed a browser tab. Catch cancellation explicitly and
rethrow, or filter it out — `catch (Exception ex) when (ex is not OperationCanceledException)`
is the compact form, and lesson 12's filters are what make it possible.

Digging the causes out of the tasks rather than out of the thrown exception is
the other production habit. Awaiting `WhenAll` gives you one exception; the
tasks themselves know about all of them. When a batch of ten uploads fails, "one
of them timed out" is much less useful than "three timed out, one was
unauthorised, and here are the ids".

Ending with a `switch` expression over the exception type is a nice closing
image for the language half of this course, because it uses lesson 02's switch
expressions, lesson 04's type hierarchy, lesson 06's patterns and lesson 12's
exceptions in one line — which is roughly what idiomatic modern C# looks like.

## Further reading

- [Asynchronous programming with async and await](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/) — the task-based model from the top.
- [Async in depth](https://learn.microsoft.com/en-us/dotnet/standard/async-in-depth) — what actually happens during an I/O wait, and why no thread is involved.
- [Task asynchronous programming model](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model) — the state machine, step by step.
- [Async guidance: avoid `async void`, avoid blocking](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/best-practices) — ASP.NET Core's list of the same mistakes at production scale.
- [`CancellationToken`](https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads) — the cooperative cancellation model in full.
- [`ConfigureAwait` FAQ](https://devblogs.microsoft.com/dotnet/configureawait-faq/) — Stephen Toub's definitive answer on contexts and deadlocks.
