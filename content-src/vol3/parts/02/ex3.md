@@PROMPT@@
## Exercise 3 - hash lookup versus binary search

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex3.cs`.

`SortedIndex.Search(int[] sorted, int value, out int comparisons)` is a binary
search that follows the BCL convention: it returns the index of the match, or
the **bitwise complement** of the index where the value would be inserted.
`comparisons` reports how many elements it looked at.

`SortedIndex.InsertionPointOf(int[] sorted, int value)` turns a negative
result back into an index: `~result`.

`Lookup.Choose(int n, int reads, int writes, bool needsOrder)` returns
`"SortedArray"` or `"Dictionary"` by this rule, checked in order:

1. `needsOrder` is true -> `"SortedArray"` (a dictionary has no order to give).
2. `n <= 16` -> `"SortedArray"` (at that size the scan is contiguous and the
   hash is pure overhead).
3. `writes * 8 > reads` -> `"Dictionary"` (an insert into a sorted array
   shifts, so writes are the expensive side).
4. Otherwise `"SortedArray"`.

```
Search(new[] { 1, 3, 5, 7, 9 }, 7, out int c)   -> 3,  c == 2
Search(new[] { 1, 3, 5, 7, 9 }, 4, out c)       -> -3, c == 3
InsertionPointOf(new[] { 1, 3, 5, 7, 9 }, 4)    -> 2
Search(Array.Empty<int>(), 1, out c)            -> -1, c == 0
Choose(1000, 1000, 1, false)                    -> "SortedArray"
Choose(1000, 10, 100, false)                    -> "Dictionary"
Choose(1000, 1000, 1000, true)                  -> "SortedArray"
Choose(8, 1, 1000, false)                       -> "SortedArray"
```

Your search must be O(log n): a thousand-element array must never cost more
than 10 comparisons.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex3
```
@@HINTS@@
## Hint 1

The complement convention exists so one return value carries two answers:
"found, here" and "not found, but it belongs here". `~x` for a non-negative `x`
is always negative, so the sign is a free flag, and `~(-3 - 1)` gets you back —
or more simply, `~(~2) == 2`.

## Hint 2

The loop, with the overflow-safe midpoint:

```csharp
int low = 0, high = array.Length - 1;
while (low <= high)
{
    int mid = low + ((high - low) / 2);   // not (low + high) / 2
    ...
}
```

`(low + high) / 2` overflows for large arrays and is the textbook bug that
lived in the JDK for nine years.

## Hint 3

When the loop exits without a match, `low` is exactly the insertion point, so
`return ~low;`. Count a comparison each time you examine `array[mid]` — once per
iteration, not once per branch. The decision left to you is where to increment
the counter so that an empty array reports zero and a five-element search
reports at most three.
@@IMPORTANT@@
## Hint 1

Think about what each structure gives you beyond the lookup. A sorted array
answers "what is the next key after this one", "give me the range 100 to 200"
and "iterate in order" — none of which a dictionary can answer at all. That is
why `needsOrder` is the first rule and not a tie-breaker.

## Hint 2

The memory difference is worth having a number for. A `Dictionary<int, int>`
entry is 16 bytes plus a bucket slot, so about 20 bytes per element, versus 8
for two parallel arrays. At a million entries that is 20 MB against 8, and the
dictionary's are scattered while the arrays stream.

## Hint 3

Write `Choose` as an ordered sequence of early returns rather than one boolean
expression. The order is the specification: order beats size, size beats the
read/write mix. If you collapse it into a single condition you will get
`Choose(8, 1, 1000, false)` wrong, and that case is in the gate precisely
because it separates the two shapes.
@@REF@@
// v3cc02_collections_by_numbers / ex3 - hash lookup versus binary search.
// See lessons/v3cc02_collections_by_numbers/README.md, "Exercise 3".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

public static class SortedIndex
{
    /// <summary>
    /// Binary search with the BCL's convention: the index on a hit, the
    /// bitwise complement of the insertion point on a miss.
    /// </summary>
    public static int Search(int[] sorted, int value, out int comparisons)
    {
        ArgumentNullException.ThrowIfNull(sorted);

        comparisons = 0;
        int low = 0;
        int high = sorted.Length - 1;

        while (low <= high)
        {
            // low + (high - low) / 2 cannot overflow; (low + high) / 2 can.
            int mid = low + ((high - low) / 2);
            comparisons++;

            int candidate = sorted[mid];
            if (candidate == value)
            {
                return mid;
            }

            if (candidate < value)
            {
                low = mid + 1;
            }
            else
            {
                high = mid - 1;
            }
        }

        // low is now exactly where the value belongs.
        return ~low;
    }

    public static int InsertionPointOf(int[] sorted, int value)
    {
        int result = Search(sorted, value, out _);
        return result >= 0 ? result : ~result;
    }
}

public static class Lookup
{
    private const int SmallEnoughToScan = 16;
    private const int WriteCostFactor = 8;

    /// <summary>
    /// The rules in order: order beats size, size beats the read/write mix.
    /// </summary>
    public static string Choose(int n, int reads, int writes, bool needsOrder)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(n);
        ArgumentOutOfRangeException.ThrowIfNegative(reads);
        ArgumentOutOfRangeException.ThrowIfNegative(writes);

        if (needsOrder)
        {
            return "SortedArray";
        }

        if (n <= SmallEnoughToScan)
        {
            return "SortedArray";
        }

        if ((long)writes * WriteCostFactor > reads)
        {
            return "Dictionary";
        }

        return "SortedArray";
    }
}
