@@PROMPT@@
## Challenge - the recommendation you can compute

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Challenge.cs`.

A workload is
`Workload(int Elements, int Reads, int Writes, bool NeedsOrder, bool
NeedsRangeQueries, bool Concurrent)`. Three candidates: `"List"`,
`"Dictionary"`, `"SortedArray"`.

`WorkloadPlanner.Estimate(Workload workload, string candidate)` returns a cost
in units, or `double.PositiveInfinity` when the candidate cannot satisfy the
workload at all (no ordering from a `Dictionary`, no range queries from a
`Dictionary` or an unsorted `List`). The cost model, stated so the gate can
check it:

- `List` — a read is a linear scan: `Elements / 2.0` units. A write is an
  append: `1.0`.
- `Dictionary` — a read is `2.0` (hash plus two probes). A write is `3.0`.
- `SortedArray` — a read is `log2(Elements) + 1` units, rounded up to a whole
  comparison count. A write shifts half the array: `Elements / 2.0`.
- Total is `Reads * readUnits + Writes * writeUnits`.
- If `Concurrent` is true, `Dictionary` costs 1.4x (lock striping and volatile
  reads) and the other two are infinite, because they need external
  synchronisation that this model does not price.

`WorkloadPlanner.Recommend(Workload workload)` returns
`Recommendation(string Winner, string RunnerUp, double Margin)`, where
`Margin` is the runner-up's cost divided by the winner's, rounded to two
decimals, and `double.PositiveInfinity` when the runner-up cannot do the job.
Ties break in the order `Dictionary`, `SortedArray`, `List`.

Then implement `SortedArrayIndex<TValue>` — `Add`, `TryGet`, `RangeCount` — so
that the structure the planner recommends for an ordered, read-heavy workload
actually exists.

```
var readHeavy = new Workload(10_000, 1_000_000, 10, false, false, false);
Estimate(readHeavy, "Dictionary")     -> 2_000_030
Estimate(readHeavy, "SortedArray")    -> 15_050_000
Recommend(readHeavy).Winner           -> "Dictionary"

var ordered = new Workload(1_000, 10_000, 10, true, true, false);
Estimate(ordered, "Dictionary")       -> double.PositiveInfinity
Recommend(ordered).Winner             -> "SortedArray"
Recommend(ordered).Margin             -> double.PositiveInfinity
```

Honest difficulty note: the arithmetic is easy and the *ordering* of the
disqualifications is not. A candidate that cannot answer the question is
infinitely expensive, not merely expensive, and that has to be decided before
any multiplier is applied.

```
uv run dojo test csharp v3cc02_collections_by_numbers challenge
```
@@HINTS@@
## Hint 1

Separate the two questions. First: can this candidate answer the workload at
all? That is a boolean about capabilities — ordering, range queries,
concurrency. Only if it passes do you compute a number. Mixing them produces a
`Dictionary` that scores well on a workload it cannot serve.

## Hint 2

The sorted array's read cost is comparisons, so it is logarithmic:

```csharp
double reads = Math.Ceiling(Math.Log2(Math.Max(elements, 1))) + 1;
```

The `Max` keeps `Log2(0)` — negative infinity — out of your model, and the
`+ 1` accounts for the final equality check. Ten thousand elements costs 15
units per read, which is why the read-heavy workload goes to the dictionary
despite the dictionary's higher write cost.

## Hint 3

`Recommend` sorts the three estimates and reports the top two. Because
infinities are involved, `double.PositiveInfinity / double.PositiveInfinity` is
`NaN` — so handle the "runner-up cannot do it" case explicitly rather than
letting the division produce something the gate cannot compare. The tie-break
order is given; implement it as a stable sort key rather than a chain of `if`s,
and you will not have to think about it again.
@@IMPORTANT@@
## Hint 1

Every number in the cost model is a claim you could defend or attack. "A
dictionary read is two units" says a hash plus two cache misses; "a sorted
array write is Elements/2" says the shift dominates. Write them as named
constants with the claim in a comment, because the point of the exercise is
that a recommendation is only as good as the model behind it.

## Hint 2

Test the model against your intuition at the extremes before trusting it:

```
new Workload(10, 1000, 0, false, false, false)     // tiny, read-only
new Workload(1_000_000, 10, 1_000_000, false, false, false)  // huge, write-heavy
```

The first should favour the list — at ten elements a scan beats a hash — and
the second should favour the dictionary. If your model disagrees, either the
model or your intuition is wrong, and finding out which is the exercise.

## Hint 3

For `SortedArrayIndex`, `Add` must keep the array sorted, which is where the
`Elements / 2` write cost comes from — do the insertion with
`Array.BinarySearch` to find the position and `Array.Copy` to open the gap,
not by appending and re-sorting. `RangeCount` should be two binary searches and
a subtraction, not a walk; that is the whole reason the structure earned its
place on an ordered workload.
@@REF@@
// v3cc02_collections_by_numbers / challenge - the recommendation you can compute.
// See lessons/v3cc02_collections_by_numbers/README.md, "Challenge".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

public readonly record struct Workload(
    int Elements,
    int Reads,
    int Writes,
    bool NeedsOrder,
    bool NeedsRangeQueries,
    bool Concurrent);

public readonly record struct Recommendation(string Winner, string RunnerUp, double Margin);

public static class WorkloadPlanner
{
    // Each constant is a claim. A dictionary read is a hash plus two cache
    // misses; a list read is half a linear scan; a sorted-array write shifts
    // half the array.
    private const double DictionaryReadUnits = 2.0;
    private const double DictionaryWriteUnits = 3.0;
    private const double ListWriteUnits = 1.0;
    private const double ConcurrencyMultiplier = 1.4;

    private static readonly string[] TieBreakOrder = ["Dictionary", "SortedArray", "List"];

    public static double Estimate(Workload workload, string candidate)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(workload.Elements);

        if (!CanServe(workload, candidate))
        {
            return double.PositiveInfinity;
        }

        double elements = workload.Elements;
        (double read, double write) = candidate switch
        {
            "List" => (elements / 2.0, ListWriteUnits),
            "Dictionary" => (DictionaryReadUnits, DictionaryWriteUnits),
            "SortedArray" => (Math.Ceiling(Math.Log2(Math.Max(elements, 1))) + 1, elements / 2.0),
            _ => throw new ArgumentException($"unknown candidate '{candidate}'", nameof(candidate)),
        };

        double total = (workload.Reads * read) + (workload.Writes * write);
        return workload.Concurrent ? total * ConcurrencyMultiplier : total;
    }

    public static Recommendation Recommend(Workload workload)
    {
        // Stable ordering: cost first, then the stated tie-break.
        List<(string Candidate, double Cost)> ranked = TieBreakOrder
            .Select(candidate => (Candidate: candidate, Cost: Estimate(workload, candidate)))
            .OrderBy(entry => entry.Cost)
            .ThenBy(entry => Array.IndexOf(TieBreakOrder, entry.Candidate))
            .ToList();

        (string winner, double winnerCost) = ranked[0];
        (string runnerUp, double runnerUpCost) = ranked[1];

        double margin = double.IsPositiveInfinity(runnerUpCost)
            ? double.PositiveInfinity                       // infinity / x is fine; infinity / infinity is NaN
            : Math.Round(runnerUpCost / winnerCost, 2);

        return new Recommendation(winner, runnerUp, margin);
    }

    private static bool CanServe(Workload workload, string candidate) => candidate switch
    {
        "Dictionary" => !workload.NeedsOrder && !workload.NeedsRangeQueries,
        "SortedArray" => !workload.Concurrent,
        "List" => !workload.NeedsOrder && !workload.NeedsRangeQueries && !workload.Concurrent,
        _ => throw new ArgumentException($"unknown candidate '{candidate}'", nameof(candidate)),
    };
}

/// <summary>
/// The structure the planner recommends for ordered, read-heavy workloads.
/// Insertion keeps the array sorted; range queries are two binary searches.
/// </summary>
public sealed class SortedArrayIndex<TValue>
{
    private int[] keys = new int[4];
    private TValue[] values = new TValue[4];

    public int Count { get; private set; }

    public void Add(int key, TValue value)
    {
        int index = Array.BinarySearch(keys, 0, Count, key);
        if (index >= 0)
        {
            values[index] = value;
            return;
        }

        int insertAt = ~index;
        EnsureCapacity(Count + 1);

        // Open the gap with one contiguous move rather than appending and
        // re-sorting: this is the Elements/2 write cost the model prices.
        Array.Copy(keys, insertAt, keys, insertAt + 1, Count - insertAt);
        Array.Copy(values, insertAt, values, insertAt + 1, Count - insertAt);

        keys[insertAt] = key;
        values[insertAt] = value;
        Count++;
    }

    public bool TryGet(int key, out TValue? value)
    {
        int index = Array.BinarySearch(keys, 0, Count, key);
        if (index >= 0)
        {
            value = values[index];
            return true;
        }

        value = default;
        return false;
    }

    /// <summary>Two binary searches and a subtraction - never a walk.</summary>
    public int RangeCount(int inclusiveLow, int inclusiveHigh)
    {
        if (inclusiveLow > inclusiveHigh)
        {
            return 0;
        }

        int low = LowerBound(inclusiveLow);
        int high = LowerBound(inclusiveHigh + 1);
        return high - low;
    }

    private int LowerBound(int key)
    {
        int index = Array.BinarySearch(keys, 0, Count, key);
        return index >= 0 ? index : ~index;
    }

    private void EnsureCapacity(int needed)
    {
        if (needed <= keys.Length)
        {
            return;
        }

        int grown = keys.Length * 2;
        Array.Resize(ref keys, grown);
        Array.Resize(ref values, grown);
    }
}
