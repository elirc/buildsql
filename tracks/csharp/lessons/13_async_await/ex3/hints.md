## Hint 1

Two different cancellation moves, and knowing which is which is the exercise.

`WaitOrCancelAsync` has to stop *waiting* for something it does not control.
`SumUntilCancelledAsync` controls its own loop, so it can check the token
itself between steps.

Neither one can stop work that is already running - which is the first thing to
internalise about cancellation in .NET.

## Hint 2

For the first: `Task.WaitAsync(CancellationToken)` (since .NET 6) does exactly
what the prompt describes — it returns a task that completes with the work, or
throws `OperationCanceledException` if the token fires first.

```csharp
return await work.WaitAsync(token);
```

For the second: `token.ThrowIfCancellationRequested()` throws
`OperationCanceledException` when the token has been signalled and does nothing
otherwise. Put it at the top of the loop body, before you await the next task.

## Hint 3

The gate proves the important limitation: after the wait is cancelled, it
asserts the underlying task is *still pending*. Cancellation is **cooperative**
— the token is a signal, and only code that checks it can act on it. Nothing in
.NET can abort a running task from outside (`Thread.Abort` used to try, and was
removed for good reasons).

That is why every async API in .NET takes a `CancellationToken` as its last
parameter and passes it down: the chain of cooperation only works if nobody
drops the token on the way through.

Left to you: `OperationCanceledException` versus `TaskCanceledException` — the
second derives from the first, so catching the first catches both. Look at
which one your implementation actually produces.
