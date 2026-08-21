## Hint 1

Two members, and the whole exercise is the two rules a wrapper must obey:
release exactly once, and refuse to be used afterwards.

The fields are already there. `_disposed` is your guard for both.

## Hint 2

```csharp
public void Dispose()
{
    if (_disposed) { return; }
    _disposed = true;
    _pool.Enqueue(_connection);
}
```

For the property, `ObjectDisposedException.ThrowIf(_disposed, this)` (since
.NET 7) is the one-liner; the older form is
`if (_disposed) throw new ObjectDisposedException(nameof(PooledConnection));`.

## Hint 3

Why "exactly once" matters here rather than being a formality: a double return
puts the same connection in the pool twice, and the pool then hands it to two
callers who both think they own it. That is a genuinely nasty production bug and
it is why the guard exists.

The interviewer's follow-ups: *"what if the caller forgets to dispose?"* (the
connection never comes back — a leak; a finaliser could return it, at the cost
of finalisation, and `SafeHandle` is the framework's answer for real handles).
*"What about async cleanup?"* (`IAsyncDisposable` and `await using`).

Left to you: whether `Dispose` should also close the connection rather than
pooling it. The class name is the specification — but noticing that the two
policies are different, and asking, is exactly what the interviewer wants to
see.
