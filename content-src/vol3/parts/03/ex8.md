@@PROMPT@@
## Exercise 8 - Dispose that gives the object back

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex8.cs`.

`BufferPool` lends `PooledBuffer` objects. A buffer's `Dispose` does not
destroy it — it resets it and returns it to the pool, so `using` becomes the
syntax for a rented resource.

- `BufferPool(int capacity)` — the pool holds at most `capacity` idle buffers;
  below 1 throws `ArgumentOutOfRangeException`.
- `PooledBuffer Rent(int minimumSize)` — reuses an idle buffer whose array is
  big enough, otherwise allocates one. `Rents` and `Allocations` count each.
- `PooledBuffer.Span` / `Written` / `Append(ReadOnlySpan<byte> data)` — using
  any of them after disposal throws `ObjectDisposedException`.
- `PooledBuffer.Dispose()` — clears `Written`, returns the buffer to the pool
  if there is room, and is **idempotent**: a second `Dispose` must not return
  it twice.
- `BufferPool.Idle` — how many buffers are available.
- A buffer returned to a full pool is simply dropped for the collector.

```
var pool = new BufferPool(capacity: 2);
using (var a = pool.Rent(16)) { a.Append(new byte[] { 1, 2 }); }
pool.Idle          -> 1
pool.Allocations   -> 1

using (var b = pool.Rent(16)) { b.Written; }   // 0 - reset on return
pool.Allocations   -> 1                        // reused, not allocated
pool.Rents         -> 2

var c = pool.Rent(16);
c.Dispose();
c.Dispose();       // no-op: the pool must not receive it twice
pool.Idle          -> 2
```

The gate rents two buffers, disposes one twice, and asserts the pool never
hands the same buffer to two owners at once.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex8
```
@@HINTS@@
## Hint 1

Reframe `Dispose` as "I am finished with this", not "destroy this". The
resource being managed is *exclusive use*, and returning the object to the pool
is exactly the release. Everything else in the exercise follows from taking
that seriously — including that using it after release is a bug.

## Hint 2

The double-return is the whole risk, so make it structurally impossible:

```csharp
public void Dispose()
{
    if (returned) return;      // one flag, checked first, set immediately
    returned = true;
    pool.Return(this);
}
```

Without the flag, one buffer lands in the idle list twice and the next two
`Rent` calls hand the same array to two owners, who then write over each other
with no exception anywhere.

## Hint 3

`Rent` has to clear the returned flag again, because the same object is coming
back to life for a new owner. That is the one piece of state that is not
"reset" in the ordinary sense — it is ownership, and it flips in both
directions. Decide where the reset belongs: in `Return`, in `Rent`, or in both,
and be able to say what goes wrong with each choice.
@@IMPORTANT@@
## Hint 1

Look at this from the pool's side. The pool cannot tell whether the caller has
really finished — it only knows what it was told. So the invariant "an idle
buffer is referenced by nobody" is enforced entirely by the buffer's own
bookkeeping. That is why the flag is not defensive tidiness, it is the only
thing holding the design together.

## Hint 2

This is the same contract `ArrayPool<T>` has, stated with objects instead of
arrays:

```csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(size);
try { Use(buffer); }
finally { ArrayPool<byte>.Shared.Return(buffer); }
// buffer must not be touched after this point - it may already be someone else's
```

Wrapping it in an `IDisposable` is a real ergonomic improvement, because
`using` cannot be forgotten the way a `finally` can.

## Hint 3

Think about what "reset" must cover. `Written` obviously, but consider whether
the array's *contents* need clearing too: for a buffer that held credentials,
leaving the bytes for the next tenant is a data leak, and clearing costs a
memset. State the policy in a comment and make the code match — the sector's
theme is that cleanup decisions should be deliberate rather than inherited.
@@REF@@
// v3cc03_deterministic_cleanup / ex8 - Dispose that gives the object back.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Exercise 8".

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>
/// Lends buffers. The resource being managed is exclusive use, so Dispose
/// means "I have finished with this", not "destroy this".
/// </summary>
public sealed class BufferPool
{
    private readonly Stack<PooledBuffer> idle = new();
    private readonly int capacity;

    public BufferPool(int capacity)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(capacity, 1);
        this.capacity = capacity;
    }

    public int Idle => idle.Count;

    public int Rents { get; private set; }

    public int Allocations { get; private set; }

    public PooledBuffer Rent(int minimumSize)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(minimumSize);

        Rents++;

        while (idle.Count > 0)
        {
            PooledBuffer candidate = idle.Pop();
            if (candidate.Capacity >= minimumSize)
            {
                candidate.Reclaim();   // ownership flips back to the caller
                return candidate;
            }
        }

        Allocations++;
        return new PooledBuffer(this, Math.Max(minimumSize, 16));
    }

    internal void Return(PooledBuffer buffer)
    {
        // A full pool simply drops the buffer: the collector is a perfectly
        // good fallback, and an unbounded pool is a memory leak with a nicer
        // name.
        if (idle.Count < capacity)
        {
            idle.Push(buffer);
        }
    }
}

public sealed class PooledBuffer : IDisposable
{
    private readonly BufferPool pool;
    private readonly byte[] array;
    private bool returned;

    internal PooledBuffer(BufferPool pool, int capacity)
    {
        this.pool = pool;
        array = new byte[capacity];
    }

    public int Capacity => array.Length;

    public int Written { get; private set; }

    public ReadOnlySpan<byte> Span
    {
        get
        {
            ObjectDisposedException.ThrowIf(returned, this);
            return array.AsSpan(0, Written);
        }
    }

    public void Append(ReadOnlySpan<byte> data)
    {
        ObjectDisposedException.ThrowIf(returned, this);

        if (data.Length > array.Length - Written)
        {
            throw new ArgumentException("buffer is full", nameof(data));
        }

        data.CopyTo(array.AsSpan(Written));
        Written += data.Length;
    }

    /// <summary>
    /// Returns the buffer to the pool. Idempotent: without the flag, one
    /// buffer lands in the idle list twice and two owners write over each
    /// other with no exception anywhere.
    /// </summary>
    public void Dispose()
    {
        if (returned)
        {
            return;
        }

        returned = true;

        // Reset the length only. The bytes are left in place because this
        // buffer never holds secrets; a buffer that did would need a Clear
        // here, and the memset is the price of that policy.
        Written = 0;
        pool.Return(this);
    }

    /// <summary>Ownership flips back to a caller as the pool lends it out.</summary>
    internal void Reclaim() => returned = false;
}
