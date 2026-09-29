@@PROMPT@@
## Exercise 4 - a bad hash, quantified

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex4.cs`.

`readonly record struct Cell(int Row, int Column)` is the key. Two comparers
implement `IEqualityComparer<Cell>`:

- `XorCellComparer` — `GetHashCode` is `Row ^ Column`.
- `MixedCellComparer` — `GetHashCode` is `HashCode.Combine(Row, Column)`.

Both `Equals` compare both fields.

`HashQuality.Measure(IEnumerable<Cell> keys, IEqualityComparer<Cell>
comparer, int buckets)` distributes the keys into `buckets` slots using
`(comparer.GetHashCode(key) & 0x7FFFFFFF) % buckets` and returns
`HashReport(int OccupiedBuckets, int LongestChain, double AverageProbe)`.
`AverageProbe` is the mean number of entries examined by a successful lookup,
which for a chain of length `L` is `(L + 1) / 2` per entry in it — round the
final average to three decimal places.

`HashQuality.SymmetricGrid(int size)` produces every `Cell(r, c)` for
`0 <= r < size` and `0 <= c < size`.

```
var grid = HashQuality.SymmetricGrid(16);            // 256 keys
HashQuality.Measure(grid, new XorCellComparer(), 512)
  -> OccupiedBuckets 16, LongestChain 16   (only 16 distinct hashes exist)
HashQuality.Measure(grid, new MixedCellComparer(), 512)
  -> OccupiedBuckets around 200, LongestChain 4 or so
HashQuality.Measure(Array.Empty<Cell>(), new MixedCellComparer(), 8)
  -> HashReport(0, 0, 0)
```

The gate asserts, over a 16x16 grid in 512 buckets, that the XOR comparer
occupies exactly 16 buckets with a longest chain of 16, that the mixed
comparer's longest chain is at most 8, and that both comparers agree on
equality for every pair.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex4
```
@@HINTS@@
## Hint 1

XOR is commutative and self-inverse, and both properties hurt. `(1, 2)` and
`(2, 1)` produce the same hash, and `(3, 3)` and `(5, 5)` both produce zero. On
a square grid that collapses a two-dimensional key space into something close
to one dimension.

## Hint 2

Bucketing, with the sign handled:

```csharp
int bucket = (comparer.GetHashCode(key) & 0x7FFFFFFF) % buckets;
```

The mask clears the sign bit, because `%` on a negative int is negative in C#
and a negative bucket index is an exception waiting for the first key that
hashes high.

## Hint 3

Count into an `int[buckets]`, then derive everything from the counts:
occupied buckets are the non-zero ones, the longest chain is the maximum, and
the average probe is the sum over buckets of `L * (L + 1) / 2` divided by the
total number of keys. Decide what the report should say when there are no keys
at all — dividing by zero is not the answer the gate wants.
@@IMPORTANT@@
## Hint 1

Equality and hashing are one contract with two halves, and only one half is
allowed to be approximate. Equal objects **must** have equal hash codes;
unequal objects may share one. Both comparers here are correct — neither is
buggy — which is the point: a legal hash can still destroy your performance.

## Hint 2

`HashCode.Combine` is not a convenience wrapper around XOR. It runs the
xxHash32 mixing steps, so each input is multiplied by a prime, rotated, and
folded into the accumulator in order:

```csharp
public override int GetHashCode() => HashCode.Combine(Row, Column);
```

Order matters, bit patterns spread, and adjacent inputs land far apart.

## Hint 3

The average-probe figure is the one that connects this to a real dictionary. A
successful lookup in a chain of length L examines, on average, `(L + 1) / 2`
entries — so a perfect distribution gives 1.0 and every collision drags it up.
Compute it as a weighted mean over the chains, not as an average of averages;
those differ whenever the chains are uneven, which is exactly the case you are
measuring.
@@REF@@
// v3cc02_collections_by_numbers / ex4 - a bad hash, quantified.
// See lessons/v3cc02_collections_by_numbers/README.md, "Exercise 4".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

public readonly record struct Cell(int Row, int Column);

public readonly record struct HashReport(int OccupiedBuckets, int LongestChain, double AverageProbe);

/// <summary>A legal hash that collapses symmetric keys onto each other.</summary>
public sealed class XorCellComparer : IEqualityComparer<Cell>
{
    public bool Equals(Cell x, Cell y) => x.Row == y.Row && x.Column == y.Column;

    public int GetHashCode(Cell obj) => obj.Row ^ obj.Column;
}

/// <summary>The same contract, mixed properly: order matters, bits spread.</summary>
public sealed class MixedCellComparer : IEqualityComparer<Cell>
{
    public bool Equals(Cell x, Cell y) => x.Row == y.Row && x.Column == y.Column;

    public int GetHashCode(Cell obj) => HashCode.Combine(obj.Row, obj.Column);
}

public static class HashQuality
{
    public static HashReport Measure(IEnumerable<Cell> keys, IEqualityComparer<Cell> comparer, int buckets)
    {
        ArgumentNullException.ThrowIfNull(keys);
        ArgumentNullException.ThrowIfNull(comparer);
        ArgumentOutOfRangeException.ThrowIfLessThan(buckets, 1);

        int[] chains = new int[buckets];
        int total = 0;

        foreach (Cell key in keys)
        {
            // Mask the sign bit: % on a negative int is negative, and a
            // negative bucket index is an exception waiting to happen.
            int bucket = (comparer.GetHashCode(key) & 0x7FFFFFFF) % buckets;
            chains[bucket]++;
            total++;
        }

        if (total == 0)
        {
            return new HashReport(0, 0, 0);
        }

        int occupied = 0;
        int longest = 0;
        long probes = 0;

        foreach (int length in chains)
        {
            if (length == 0)
            {
                continue;
            }

            occupied++;
            longest = Math.Max(longest, length);

            // A successful lookup in a chain of length L examines (L + 1) / 2
            // entries on average, so the chain contributes L * (L + 1) / 2.
            probes += (long)length * (length + 1) / 2;
        }

        double average = Math.Round((double)probes / total, 3);
        return new HashReport(occupied, longest, average);
    }

    public static Cell[] SymmetricGrid(int size)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(size);

        Cell[] cells = new Cell[size * size];
        int index = 0;
        for (int row = 0; row < size; row++)
        {
            for (int column = 0; column < size; column++)
            {
                cells[index++] = new Cell(row, column);
            }
        }

        return cells;
    }
}
