## Hint 1

Two small bodies. `Dispose` writes one line to the log and must be safe to call
again. `Run` opens the resource in a `using`, uses it, maybe throws, and
catches that throw *outside* the using.

Before you write `Run`, predict the two logs. The order is the exercise.

## Hint 2

The `_disposed` field is already declared — guard on it:

```csharp
public void Dispose()
{
    if (_disposed) { return; }
    _disposed = true;
    _log.Add("dispose");
}
```

`Run` uses a *using declaration* — no braces, scoped to the enclosing block:

```csharp
try
{
    using Resource resource = new Resource(log);
    resource.Use();
    // maybe throw; otherwise log "finished"
}
catch (InvalidOperationException)
{
    log.Add("caught");
}
```

## Hint 3

The two orders are different and both are correct:

- no throw: `open, use, finished, dispose` — the using disposes at the end of
  the block, after your last statement;
- throw: `open, use, dispose, caught` — the stack unwinds out of the `try`
  block, which disposes on the way, and only then does the catch run.

That second ordering is the entire reason `using` exists. Cleanup written at
the bottom of a `try` block never happens on the failure path, which is exactly
when you most needed the file closed.

Left to you: the full `IDisposable` pattern for a class with unmanaged
resources adds a `protected virtual void Dispose(bool)` and a finaliser. It is
overkill here and worth reading about once — the reading notes say when you
actually need it.
