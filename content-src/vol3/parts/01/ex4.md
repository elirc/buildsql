@@PROMPT@@
## Exercise 4 - the 85,000-byte cliff

Edit `src/Lessons/V3CC01_GcGenerations/Ex4.cs`.

Model the 64-bit managed size of a single-dimension array exactly as the
runtime lays it out: **24 bytes of overhead** (object header word, method table
pointer, length field plus its padding) plus the payload, with the total
rounded up to the next multiple of **8**.

- `HeapPlanner.ArrayBytes(int elementSize, int length)` — the size in bytes.
  `elementSize` below 1 and `length` below 0 both throw
  `ArgumentOutOfRangeException`.
- `HeapPlanner.LohThreshold` — the constant `85_000`.
- `HeapPlanner.Destination(int elementSize, int length)` — `"LOH"` when the
  size is at or above the threshold, otherwise `"Gen0"`.
- `HeapPlanner.MaxElementsInGen0(int elementSize)` — the largest `length`
  whose array still lands in gen0.

```
ArrayBytes(1, 0)            -> 24
ArrayBytes(4, 10)           -> 64
ArrayBytes(1, 1)            -> 32        (24 + 1, rounded up to 8)
ArrayBytes(4, 21242)        -> 84992     -> Destination "Gen0"
ArrayBytes(4, 21243)        -> 85000     -> Destination "LOH"
MaxElementsInGen0(4)        -> 21242
MaxElementsInGen0(1)        -> 84968
MaxElementsInGen0(85_000)   -> 0
```

Use `long` arithmetic internally: `ArrayBytes(8, int.MaxValue)` must not
overflow into a negative number.

```
uv run dojo test csharp v3cc01_gc_generations ex4
```
@@HINTS@@
## Hint 1

Two separate ideas are being tested and it helps to write them separately.
One is the layout arithmetic — overhead, payload, alignment. The other is that
the threshold applies to the *whole allocation*, header included, which is why
a payload of exactly 84,992 bytes can still be a large object.

## Hint 2

Rounding up to the next multiple of eight, without a loop and without floating
point:

```csharp
static long RoundUpTo8(long value) => (value + 7) & ~7L;
```

The mask trick works because 8 is a power of two. `(value + 7) / 8 * 8` is the
same thing if you prefer to read it.

## Hint 3

`MaxElementsInGen0` is the inverse of `ArrayBytes`. Solve it directly rather
than looping: the largest total that still counts as gen0 is `LohThreshold - 8`
once you account for alignment, so subtract the overhead and divide by the
element size. Then decide what to do when the answer would be negative —
`MaxElementsInGen0(85_000)` has to return something sensible, and a negative
length is not it.
@@IMPORTANT@@
## Hint 1

Work backwards from a question you would actually be asked: "how big can my
buffer be before it goes on the large object heap?" Every method here is one
phrasing of that question, and the arithmetic is shared.

## Hint 2

Check your model against a fact you can verify: an empty `object` costs 24
bytes on 64-bit (16 of header plus 8 of padding), and `new byte[0]` costs 24
too — header, method table pointer, and the length field. Every element you add
is pure payload from there.

## Hint 3

For the inverse, be careful with the boundary. Test your answer by feeding it
straight back in: `Destination(size, MaxElementsInGen0(size))` must be
`"Gen0"`, and `Destination(size, MaxElementsInGen0(size) + 1)` must be `"LOH"`.
If both hold for element sizes 1, 4, 8 and 16 you have it; if one fails you are
off by an alignment step.
@@REF@@
// v3cc01_gc_generations / ex4 - the 85,000-byte cliff.
// See lessons/v3cc01_gc_generations/README.md, "Exercise 4".

namespace CSharpDojo.V3CC01_GcGenerations;

/// <summary>
/// Size arithmetic for single-dimension arrays on 64-bit .NET: 24 bytes of
/// overhead (header word, method table pointer, length plus padding) then the
/// payload, rounded up to an 8-byte boundary.
/// </summary>
public static class HeapPlanner
{
    public const int LohThreshold = 85_000;
    private const int ArrayOverheadBytes = 24;
    private const int Alignment = 8;

    public static long ArrayBytes(int elementSize, int length)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(elementSize, 1);
        ArgumentOutOfRangeException.ThrowIfNegative(length);

        long payload = (long)elementSize * length;
        return RoundUp(ArrayOverheadBytes + payload);
    }

    public static string Destination(int elementSize, int length) =>
        ArrayBytes(elementSize, length) >= LohThreshold ? "LOH" : "Gen0";

    /// <summary>
    /// The largest element count that still lands in gen0. Solved directly:
    /// the largest aligned total below the threshold is LohThreshold - 8.
    /// </summary>
    public static int MaxElementsInGen0(int elementSize)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(elementSize, 1);

        long largestTotal = RoundDown(LohThreshold - 1);
        long payload = largestTotal - ArrayOverheadBytes;
        if (payload < 0)
        {
            return 0;
        }

        long length = payload / elementSize;
        return length > int.MaxValue ? int.MaxValue : (int)length;
    }

    private static long RoundUp(long value) => (value + (Alignment - 1)) & ~((long)Alignment - 1);

    private static long RoundDown(long value) => value & ~((long)Alignment - 1);
}
