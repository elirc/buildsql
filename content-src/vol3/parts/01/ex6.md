@@PROMPT@@
## Exercise 6 - renting instead of allocating

Edit `src/Lessons/V3CC01_GcGenerations/Ex6.cs`.

`ChunkCopier.CopyThrough(byte[] source, byte[] destination, int chunkSize)`
copies `source` into `destination` one chunk at a time, staging each chunk in a
buffer rented from `ArrayPool<byte>.Shared`, and returns the number of chunks
it used.

Rules the gate checks:

- The rented buffer is returned exactly once, in a `finally`, even when the
  copy throws.
- The payload length is `chunkSize` (or whatever is left), never
  `buffer.Length` — the pool hands back an array of *at least* the requested
  size.
- `destination` shorter than `source` throws `ArgumentException`;
  `chunkSize` below 1 throws `ArgumentOutOfRangeException`.
- An empty source copies nothing and returns `0`.

`ChunkCopier.RentedLengthAtLeast(int requested)` returns the actual length of
an array rented for `requested` elements (rent, read `Length`, return) — proof
that "at least" is not "exactly".

```
CopyThrough(new byte[10], new byte[10], 4)   -> 3   (4 + 4 + 2)
CopyThrough(new byte[0], new byte[0], 4)     -> 0
RentedLengthAtLeast(100)                     -> >= 100, usually 128
```

```
uv run dojo test csharp v3cc01_gc_generations ex6
```
@@HINTS@@
## Hint 1

The pool is a lending library with two rules that are not in the method name:
what you get back may be bigger than you asked for, and it contains whatever
the last borrower left in it. Every bug in pooled code comes from forgetting
one of those.

## Hint 2

The frame, applied to a different job:

```csharp
char[] buffer = ArrayPool<char>.Shared.Rent(needed);
try
{
    text.CopyTo(0, buffer, 0, needed);
    return new string(buffer, 0, needed);   // 0..needed, not 0..buffer.Length
}
finally
{
    ArrayPool<char>.Shared.Return(buffer);
}
```

## Hint 3

Rent once outside the loop, not once per chunk — the point is to allocate a
buffer zero times, and renting per iteration is only marginally better than
allocating per iteration. Each pass computes `taken = Math.Min(chunkSize,
source.Length - offset)`, copies `taken` bytes in and `taken` bytes out, and
advances. Decide for yourself whether `Return` should pass
`clearArray: true`, and be able to defend the answer in terms of what the
buffer held.
@@IMPORTANT@@
## Hint 1

Before writing the pooled version, write the version that allocates
`new byte[chunkSize]` inside the loop and measure it with the probe from ex1.
The number you are trying to drive to zero is the reason for all the extra
ceremony.

## Hint 2

Spans make the copying readable and bounds-checked in one step:

```csharp
source.AsSpan(offset, taken).CopyTo(buffer);
buffer.AsSpan(0, taken).CopyTo(destination.AsSpan(offset));
```

`CopyTo` throws if the destination is too short, which is a better failure than
a silent partial copy.

## Hint 3

For the guards, decide the order: check `chunkSize` before touching the arrays,
and check the destination length before renting anything. A guard that throws
*after* the rent but *before* the `try` leaks the buffer for the lifetime of
the pool — that is the subtle one, and it is why the rent should be the first
statement before the `try` and nothing else should sit between them.
@@REF@@
// v3cc01_gc_generations / ex6 - renting instead of allocating.
// See lessons/v3cc01_gc_generations/README.md, "Exercise 6".

using System.Buffers;

namespace CSharpDojo.V3CC01_GcGenerations;

public static class ChunkCopier
{
    /// <summary>
    /// Copies source into destination through a single rented staging buffer.
    /// Returns the number of chunks used.
    /// </summary>
    public static int CopyThrough(byte[] source, byte[] destination, int chunkSize)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(destination);
        ArgumentOutOfRangeException.ThrowIfLessThan(chunkSize, 1);

        if (destination.Length < source.Length)
        {
            throw new ArgumentException("destination is shorter than source", nameof(destination));
        }

        if (source.Length == 0)
        {
            return 0;
        }

        // Rent immediately before the try: nothing may throw in between, or
        // the buffer never comes back to the pool.
        byte[] buffer = ArrayPool<byte>.Shared.Rent(chunkSize);
        try
        {
            int chunks = 0;
            for (int offset = 0; offset < source.Length; offset += chunkSize)
            {
                int taken = Math.Min(chunkSize, source.Length - offset);

                // taken, never buffer.Length: the pool may have handed us more.
                source.AsSpan(offset, taken).CopyTo(buffer);
                buffer.AsSpan(0, taken).CopyTo(destination.AsSpan(offset));
                chunks++;
            }

            return chunks;
        }
        finally
        {
            // The staged bytes are a copy of data the caller already owns, so
            // clearing buys nothing here. Pass true when the buffer held
            // anything a later tenant should not read.
            ArrayPool<byte>.Shared.Return(buffer, clearArray: false);
        }
    }

    /// <summary>Shows that Rent gives you at least, not exactly.</summary>
    public static int RentedLengthAtLeast(int requested)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(requested);

        byte[] buffer = ArrayPool<byte>.Shared.Rent(requested);
        try
        {
            return buffer.Length;
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }
    }
}
