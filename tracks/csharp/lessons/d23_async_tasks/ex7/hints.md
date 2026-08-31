## Hint 1

A single `WhenAny` is not enough, because the first task to finish might have
finished by failing. You need to wait again, on what is left.

So: a list of pending tasks, and a loop that removes one each time round.

## Hint 2

```csharp
List<Task<T>> pending = new List<Task<T>>(all);

while (pending.Count > 0)
{
    Task<T> finished = await Task.WhenAny(pending);
    pending.Remove(finished);

    if (finished.Status == TaskStatus.RanToCompletion) { return await finished; }
}
```

`Status == TaskStatus.RanToCompletion` is the success test. `IsCompleted` would
be true for the failures too, and `!IsFaulted` would let a cancelled task
through and then throw when you awaited it.

## Hint 3

The give-up path needs every failure, and in **task** order rather than the
order they happened to finish - so keep the original list as well as the
shrinking one, and build the `AggregateException` from that:

```csharp
throw new AggregateException(all.Select(task => task.Exception!.InnerException!));
```

Reporting them in completion order would make the same set of failures produce
different-looking logs on different runs, which is exactly what you do not want
when you are trying to understand a system.

Decide for yourself what this should do about a task that was *cancelled* - the
gate does not test it, and the two defensible answers (treat it as a failure,
or let it out) say different things about what the method is for.
