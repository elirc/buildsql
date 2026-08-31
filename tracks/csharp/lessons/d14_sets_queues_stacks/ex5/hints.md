## Hint 1

Keep a `Queue<int>` of the times at which requests were GRANTED. Because
times never decrease, the oldest allowance is always at the front - so
expiry is a `while` loop: peek, and dequeue while the front is old enough
to have aged out. Refusals are never enqueued.

## Hint 2

The boundary is `<=`: an allowance from time t is gone once
`t <= second - windowSeconds`.

```csharp
while (_granted.Count > 0 && _granted.Peek() <= second - _windowSeconds)
{
    _granted.Dequeue();
}
```

After evicting: refuse when `Count >= _limit`, otherwise enqueue `second`
and grant. `InWindow` is just the queue's `Count`.
