## Hint 1

The thing you cache is the **`Task`**, not the value. That single decision is
what makes the coalescing work: a caller who arrives while the work is still
running can be handed the same in-flight task and will get the answer when it
arrives.

`GetAsync` is not `async` and does not await anything. It hands back a task.

## Hint 2

```csharp
if (_task is null)
{
    FactoryCalls++;
    _task = _factory();
}

return _task;
```

That is the whole coalescing behaviour. Notice what a cache that stored the
*result* instead could not do: it would only be able to help callers who
arrive after the work finished, so the stampede it was built to prevent goes
straight through.

## Hint 3

The last requirement is the failure rule. A faulted task must not stay cached,
or one unlucky moment poisons the value for the lifetime of the process:

```csharp
if (_task is not null && _task.IsFaulted) { _task = null; }
```

at the top, before the null check.

This version is deliberately not thread-safe - two threads arriving at exactly
the same moment could both see `null` and both call the factory. Making it safe
means a lock around the check, or `Lazy<Task<T>>` with
`LazyThreadSafetyMode.ExecutionAndPublication`. Decide which you would ship,
and note that knowing you have not solved it is worth more than assuming you
have.
