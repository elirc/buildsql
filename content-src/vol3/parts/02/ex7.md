@@PROMPT@@
## Exercise 7 - build once, read a million times

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex7.cs`.

`FrozenLookup<TKey, TValue>` where `TKey : IComparable<TKey>` is built once
from a sequence of pairs and never changes: sorted key and value arrays, binary
search on read, no buckets, no chains, no per-entry overhead.

- `static FrozenLookup<TKey, TValue> Build(IEnumerable<KeyValuePair<TKey,
  TValue>> pairs)` — sorts by key; a duplicate key throws `ArgumentException`
  naming the key.
- `bool TryGet(TKey key, out TValue? value)` and `int Count`.
- `IReadOnlyList<TKey> Keys` — in sorted order, which is the thing a
  `Dictionary` cannot offer.
- `IEnumerable<KeyValuePair<TKey, TValue>> Range(TKey inclusiveLow, TKey
  inclusiveHigh)` — the ordered-structure payoff: every pair whose key falls in
  the range, in order.

Then the economics:

`Economics.BreakEvenQueries(double buildCostUnits, double dictionaryReadUnits,
double frozenReadUnits)` returns the smallest whole number of reads at which
building the frozen structure has repaid itself, or `-1` when the frozen read
is not actually cheaper. Assume the dictionary's build cost is the baseline
and `buildCostUnits` is the *extra* cost of freezing.

```
var lookup = FrozenLookup<string, int>.Build(new Dictionary<string, int>
{
    ["delta"] = 4, ["alpha"] = 1, ["charlie"] = 3,
});
lookup.Keys                       -> ["alpha", "charlie", "delta"]
lookup.TryGet("charlie", out int v)  -> true, v == 3
lookup.Range("b", "d")            -> [charlie=3]
BreakEvenQueries(1200, 1.0, 0.7)  -> 4000
BreakEvenQueries(1200, 1.0, 1.0)  -> -1
BreakEvenQueries(0, 1.0, 0.7)     -> 0
```

```
uv run dojo test csharp v3cc02_collections_by_numbers ex7
```
@@HINTS@@
## Hint 1

Two arrays, sorted together, is the whole structure. Sort the pairs once at
build time, split them into a `TKey[]` and a `TValue[]`, and every read is
`Array.BinarySearch` over the keys with the value taken from the same index.
The parallel arrays are what keep it cache friendly — one contiguous run of
keys, no per-entry object.

## Hint 2

`Array.BinarySearch` already returns the complement convention you implemented
in ex3, and that is exactly what `Range` needs:

```csharp
int start = Array.BinarySearch(keys, low);
if (start < 0) start = ~start;      // first key at or above low
```

so the range walk starts at the right place whether or not the boundary key
exists.

## Hint 3

`BreakEvenQueries` is one inequality: `build + n * frozen <= n * dictionary`.
Solve for `n`, round *up*, and handle the case where `frozen >= dictionary`
separately — no number of reads repays a structure that is not faster to read.
The decision left to you is what to return when the build is free and the read
is cheaper; zero and one are both defensible and only one matches the gate, so
reason it through rather than guessing.
@@IMPORTANT@@
## Hint 1

Ask what you are giving up. A frozen structure cannot be added to, so every
change means a rebuild. That is fine for a routing table loaded at startup and
absurd for a per-request cache — and the break-even calculation is how you turn
that instinct into a threshold you can quote.

## Hint 2

The duplicate-key check is easier after sorting, because duplicates are
adjacent:

```csharp
for (int i = 1; i < keys.Length; i++)
    if (keys[i].CompareTo(keys[i - 1]) == 0)
        throw new ArgumentException($"duplicate key '{keys[i]}'", nameof(pairs));
```

One pass, no set, no extra allocation — and it detects duplicates that
`Dictionary` construction would have thrown on anyway, at the same point in the
lifecycle.

## Hint 3

`Range` should be lazy or eager deliberately, not by accident. If you write it
with `yield return`, a caller who takes the first element does the minimum
work; if you build a list, the cost is paid up front but the result is stable
if the caller enumerates twice. Pick one, and be able to say which property you
chose.
@@REF@@
// v3cc02_collections_by_numbers / ex7 - build once, read a million times.
// See lessons/v3cc02_collections_by_numbers/README.md, "Exercise 7".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

/// <summary>
/// Build once, read forever: two parallel sorted arrays, binary search on
/// read. No buckets, no chains, no per-entry object - and ordering for free,
/// which is the thing a Dictionary cannot give you at any price.
/// </summary>
public sealed class FrozenLookup<TKey, TValue>
    where TKey : IComparable<TKey>
{
    private readonly TKey[] keys;
    private readonly TValue[] values;

    private FrozenLookup(TKey[] keys, TValue[] values)
    {
        this.keys = keys;
        this.values = values;
    }

    public int Count => keys.Length;

    public IReadOnlyList<TKey> Keys => keys;

    public static FrozenLookup<TKey, TValue> Build(IEnumerable<KeyValuePair<TKey, TValue>> pairs)
    {
        ArgumentNullException.ThrowIfNull(pairs);

        KeyValuePair<TKey, TValue>[] sorted = pairs.ToArray();
        Array.Sort(sorted, static (a, b) => a.Key.CompareTo(b.Key));

        TKey[] keys = new TKey[sorted.Length];
        TValue[] values = new TValue[sorted.Length];
        for (int i = 0; i < sorted.Length; i++)
        {
            // Duplicates are adjacent once sorted, so one pass finds them.
            if (i > 0 && sorted[i].Key.CompareTo(sorted[i - 1].Key) == 0)
            {
                throw new ArgumentException($"duplicate key '{sorted[i].Key}'", nameof(pairs));
            }

            keys[i] = sorted[i].Key;
            values[i] = sorted[i].Value;
        }

        return new FrozenLookup<TKey, TValue>(keys, values);
    }

    public bool TryGet(TKey key, out TValue? value)
    {
        int index = Array.BinarySearch(keys, key);
        if (index >= 0)
        {
            value = values[index];
            return true;
        }

        value = default;
        return false;
    }

    /// <summary>
    /// Eager on purpose: the result is a stable snapshot the caller can
    /// enumerate more than once without repeating the search.
    /// </summary>
    public IEnumerable<KeyValuePair<TKey, TValue>> Range(TKey inclusiveLow, TKey inclusiveHigh)
    {
        List<KeyValuePair<TKey, TValue>> result = new();
        if (inclusiveLow.CompareTo(inclusiveHigh) > 0)
        {
            return result;
        }

        int start = Array.BinarySearch(keys, inclusiveLow);
        if (start < 0)
        {
            start = ~start;   // first key at or above the low bound
        }

        for (int i = start; i < keys.Length && keys[i].CompareTo(inclusiveHigh) <= 0; i++)
        {
            result.Add(new KeyValuePair<TKey, TValue>(keys[i], values[i]));
        }

        return result;
    }
}

public static class Economics
{
    /// <summary>
    /// Smallest read count at which build + n * frozen &lt;= n * dictionary.
    /// -1 when the frozen read is not cheaper, because no number of reads
    /// repays a structure that is not faster to read.
    /// </summary>
    public static int BreakEvenQueries(double buildCostUnits, double dictionaryReadUnits, double frozenReadUnits)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(buildCostUnits);

        double saving = dictionaryReadUnits - frozenReadUnits;
        if (saving <= 0)
        {
            return -1;
        }

        return (int)Math.Ceiling(buildCostUnits / saving);
    }
}
