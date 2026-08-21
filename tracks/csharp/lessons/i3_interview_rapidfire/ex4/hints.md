## Hint 1

Both methods have the same two-part shape: wait for everything, then look at
what each task actually did.

The catch is that awaiting `Task.WhenAll` *throws* when any task failed — so the
waiting part needs a `try`, and the answering part comes after it.

## Hint 2

```csharp
try
{
    await Task.WhenAll(tasks);
}
catch
{
    // every task has finished either way
}

return tasks.Count(task => task.IsCompletedSuccessfully);
```

The empty catch is deliberate and deserves that comment: you are not ignoring
the failures, you are about to inspect them individually.

`TotalOfSucceededAsync` filters on `IsCompletedSuccessfully` before summing
`task.Result` — reading `.Result` on a faulted task would rethrow.

## Hint 3

Three facts this drill is checking, all of them [***] material:

- `Task.WhenAll` waits for **every** task even after one fails;
- awaiting it rethrows only the **first** exception — the others are reachable
  only from the tasks (or from `WhenAll`'s own `AggregateException`);
- a task knows its own outcome: `IsCompletedSuccessfully`, `IsFaulted`,
  `IsCanceled`, and `Exception`.

Left to you: a bare `catch` here is fine because the very next line examines
every outcome — but it would also swallow an `OperationCanceledException`. Decide
whether this method should treat cancellation as "just another failure", and be
ready to defend the answer.
