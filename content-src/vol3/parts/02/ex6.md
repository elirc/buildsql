@@PROMPT@@
## Exercise 6 - amortised, proved

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex6.cs`.

`RingDeque<T>` is a double-ended queue over a circular buffer.

- `RingDeque(int capacity = 4)` — capacity below 1 throws
  `ArgumentOutOfRangeException`.
- `PushBack(T item)`, `PushFront(T item)`, `T PopBack()`, `T PopFront()` —
  popping an empty deque throws `InvalidOperationException`.
- `Count`, `Capacity`, and `Copies` — the total number of elements ever moved
  by a growth, which is the amortisation evidence.
- Growing doubles the capacity and unrolls the ring so the elements are
  contiguous from index 0 again.
- `T this[int index]` — logical index from the front, `ArgumentOutOfRangeException`
  outside the range.
- `T[] ToArray()` — front to back.

```
var d = new RingDeque<int>(capacity: 2);
d.PushBack(1); d.PushBack(2); d.PushFront(0);   // grows here
d.ToArray()      -> [0, 1, 2]
d.Count          -> 3
d.Capacity       -> 4
d.Copies         -> 2
d.PopFront()     -> 0
d[0]             -> 1

var big = new RingDeque<int>(4);
for (int i = 0; i < 1000; i++) big.PushBack(i);
big.Copies       -> 1020    ( 4 + 8 + 16 + ... + 512, strictly under 2 * 1000 )
```

The gate pushes a thousand items and asserts `Copies < 2 * 1000`, then
interleaves pushes and pops at both ends and checks the contents survive the
wrap.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex6
```
@@HINTS@@
## Hint 1

A ring is an array plus two numbers. Keep `head` (the index of the front
element) and `count`; the back is `(head + count) % Capacity`, and pushing to
the front is `head = (head - 1 + Capacity) % Capacity`. The `+ Capacity` is
there because C#'s `%` returns a negative result for a negative left operand.

## Hint 2

The logical-to-physical mapping is the same expression everywhere, so write it
once:

```csharp
private int PhysicalIndex(int logical) => (head + logical) % buffer.Length;
```

Then the indexer, `ToArray` and the growth all read the buffer through it and
none of them has to think about the wrap.

## Hint 3

Growth is the interesting method: allocate a buffer twice the size, copy the
elements in *logical* order into slots 0..count-1, set `head = 0`, and add
`count` to `Copies`. Doubling is what makes the copies sum to less than the
element count; try changing it to `capacity + 4` afterwards and watch `Copies`
go quadratic, which is the fastest way to feel what amortised means.
@@IMPORTANT@@
## Hint 1

Write `ToArray` and the indexer before the growth. If those two are right, the
growth is easy to verify — copy through them, so the new buffer is correct by
construction — and if they are wrong, every other bug you find will be a
symptom of them.

## Hint 2

`Queue<T>` in the BCL is exactly this structure, and its growth code contains
the same branch you will need:

```csharp
if (head < tail) Array.Copy(buffer, head, next, 0, count);
else { /* two segments: head..end, then 0..tail */ }
```

You can either write that branch or copy element by element through the
logical index. One is faster and one is obviously correct; at this size, pick
the obvious one and say why.

## Hint 3

The empty and full cases collide in a ring: `head == tail` means both. That is
why `count` is a field rather than something you derive from the two indices —
carrying the count is the standard fix, and it also gives you `Count` for free.
Decide what `PopBack` should leave in the vacated slot; for a reference type,
leaving the old value there keeps an object alive that the caller thinks they
have dropped.
@@REF@@
// v3cc02_collections_by_numbers / ex6 - amortised, proved.
// See lessons/v3cc02_collections_by_numbers/README.md, "Exercise 6".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

/// <summary>
/// A double-ended queue over a circular buffer. Copies is the amortisation
/// evidence: doubling keeps the total moves below the element count.
/// </summary>
public sealed class RingDeque<T>
{
    private T[] buffer;
    private int head;

    public RingDeque(int capacity = 4)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(capacity, 1);
        buffer = new T[capacity];
    }

    public int Count { get; private set; }

    public int Capacity => buffer.Length;

    /// <summary>Total elements ever moved by a growth.</summary>
    public int Copies { get; private set; }

    public T this[int index]
    {
        get
        {
            ArgumentOutOfRangeException.ThrowIfNegative(index);
            ArgumentOutOfRangeException.ThrowIfGreaterThanOrEqual(index, Count);
            return buffer[PhysicalIndex(index)];
        }
    }

    public void PushBack(T item)
    {
        GrowIfFull();
        buffer[PhysicalIndex(Count)] = item;
        Count++;
    }

    public void PushFront(T item)
    {
        GrowIfFull();

        // + Capacity because % of a negative left operand is negative in C#.
        head = (head - 1 + Capacity) % Capacity;
        buffer[head] = item;
        Count++;
    }

    public T PopFront()
    {
        ThrowIfEmpty();

        T item = buffer[head];
        buffer[head] = default!;   // do not pin a reference the caller dropped
        head = (head + 1) % Capacity;
        Count--;
        return item;
    }

    public T PopBack()
    {
        ThrowIfEmpty();

        int last = PhysicalIndex(Count - 1);
        T item = buffer[last];
        buffer[last] = default!;
        Count--;
        return item;
    }

    public T[] ToArray()
    {
        T[] result = new T[Count];
        for (int i = 0; i < Count; i++)
        {
            result[i] = buffer[PhysicalIndex(i)];
        }

        return result;
    }

    private int PhysicalIndex(int logical) => (head + logical) % Capacity;

    private void GrowIfFull()
    {
        if (Count < Capacity)
        {
            return;
        }

        // Doubling is what makes the total copies sum to less than n.
        T[] grown = new T[Capacity * 2];
        for (int i = 0; i < Count; i++)
        {
            grown[i] = buffer[PhysicalIndex(i)];
        }

        Copies += Count;
        buffer = grown;
        head = 0;
    }

    private void ThrowIfEmpty()
    {
        if (Count == 0)
        {
            throw new InvalidOperationException("the deque is empty");
        }
    }
}
