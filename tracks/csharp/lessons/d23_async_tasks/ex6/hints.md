## Hint 1

Four states, and the properties that distinguish them are `IsCompleted`,
`IsCanceled` and `IsFaulted`. Watch the order: `IsCompleted` is true for a
failure and a cancellation as well as a success, so it cannot be the last test.

Nothing in this exercise awaits anything.

## Hint 2

```csharp
if (!task.IsCompleted) { return "pending"; }
if (task.IsCanceled)   { return "cancelled"; }
if (task.IsFaulted)    { return $"faulted:{task.Exception!.InnerException!.Message}"; }
return "ok";
```

Cancellation is its own state rather than a kind of failure - `IsFaulted` is
false for a cancelled task - which is why it has to be checked separately.
`task.Exception` is always an `AggregateException`, so the readable message is
one level in.

For `ResultOrFallback`, `task.IsCompletedSuccessfully` is the single test that
excludes pending, faulted and cancelled at once - and it is what makes reading
`task.Result` safe on the next line. Reading `.Result` on a *pending* task
blocks the calling thread until somebody else finishes it, which is the classic
way to deadlock a UI or a request thread.
