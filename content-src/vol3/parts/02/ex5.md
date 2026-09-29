@@PROMPT@@
## Exercise 5 - what a capacity argument buys

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex5.cs`.

Model the `Dictionary` growth policy: the first insert sizes the table to the
smallest prime in the table below that is at least 3, and every resize moves to
the smallest prime that is **at least double** the current capacity. When a
resize happens, every entry currently stored is rehashed into the new table —
that is the cost.

The prime table is supplied as `GrowthPlan.Primes` and starts
`3, 7, 11, 17, 23, 29, 37, 47, 59, 71, 89, 107, 131, 163, 197, 239, 293, 353,
431, 521, 631, 761, 919, 1103, 1327, 1597, 1931, 2333, 2801, 3371, 4049`.

- `GrowthPlan.NextPrimeAtLeast(int minimum)` — the first prime in the table at
  or above `minimum`; throws `ArgumentOutOfRangeException` if the table has
  nothing that large.
- `GrowthPlan.ForCount(int count)` — the capacities the table passes through
  while `count` items are inserted one at a time into a dictionary created with
  no capacity. `ForCount(0)` is empty.
- `GrowthPlan.EntryCopies(int count)` — the total entries rehashed across those
  resizes.
- `GrowthPlan.WithCapacity(int count)` — the single capacity a dictionary
  created as `new Dictionary(count)` uses.
- `GrowthPlan.SavedBy(int count)` — `(int Resizes, int EntryCopies)` avoided by
  passing the capacity.

```
ForCount(1)      -> [3]
ForCount(8)      -> [3, 7, 17]
ForCount(1000)   -> [3, 7, 17, 37, 89, 197, 431, 919, 1931]
EntryCopies(1000)-> 1700          (3+7+17+37+89+197+431+919)
WithCapacity(1000) -> 1103
SavedBy(1000)    -> (8, 1700)
EntryCopies(3)   -> 0             (three items fit the first table exactly)
```

```
uv run dojo test csharp v3cc02_collections_by_numbers ex5
```
@@HINTS@@
## Hint 1

Simulate the inserts rather than deriving a formula. Keep `capacity` and
`stored`; when `stored == capacity` and another item arrives, resize first —
which appends the new capacity to the list and adds `stored` to the copy
count — then store. The sequence falls out.

## Hint 2

The two "next prime" questions are different and both appear here:

```csharp
NextPrimeAtLeast(count);            // sizing to a known count
NextPrimeAtLeast(capacity * 2);     // growing an existing table
```

The first is why `new Dictionary(1000)` gives 1103 rather than 1000. The second
is why the sequence roughly doubles but never exactly.

## Hint 3

`EntryCopies` is the sum of the capacities *before* each resize, which is the
same as the sum of every capacity in the sequence except the last. Prove that
to yourself on `ForCount(8)` — the copies are 3 and 7, ten in total — before
writing the loop, and decide whether you compute it inside `ForCount` or as a
second pass over its result.
@@IMPORTANT@@
## Hint 1

The result you are heading for is a sentence: "inserting a thousand entries
without a capacity rehashes 1,700 entries and allocates nine tables; passing
the capacity does neither." Get the sentence right and the code is a
transcription of it.

## Hint 2

The same arithmetic applies to `List<T>`, with doubling instead of primes:

```csharp
var list = new List<int>();          // 0, then 4, 8, 16, 32, ... 1024
var sized = new List<int>(1000);     // one array, no copies
```

For n items the total elements copied is just under n in both cases — the
geometric series — which is what "amortised O(1)" means as arithmetic rather
than as a slogan.

## Hint 3

Watch the boundary in `ForCount`. A dictionary resizes when it is *full and
another item arrives*, not when it reaches some load factor, so exactly three
items produce `[3]` and zero copies while four produce `[3, 7]` and three
copies. Getting that off by one shifts every later number, which is why the
gate checks the small cases as carefully as the thousand.
@@REF@@
// v3cc02_collections_by_numbers / ex5 - what a capacity argument buys.
// See lessons/v3cc02_collections_by_numbers/README.md, "Exercise 5".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

/// <summary>
/// The Dictionary growth policy as arithmetic: prime capacities, doubling as
/// the lower bound, and every stored entry rehashed on each resize.
/// </summary>
public static class GrowthPlan
{
    public static readonly int[] Primes =
    [
        3, 7, 11, 17, 23, 29, 37, 47, 59, 71, 89, 107, 131, 163, 197, 239,
        293, 353, 431, 521, 631, 761, 919, 1103, 1327, 1597, 1931, 2333,
        2801, 3371, 4049,
    ];

    public static int NextPrimeAtLeast(int minimum)
    {
        foreach (int prime in Primes)
        {
            if (prime >= minimum)
            {
                return prime;
            }
        }

        throw new ArgumentOutOfRangeException(nameof(minimum), minimum, "beyond the modelled prime table");
    }

    /// <summary>The capacities the table passes through for count inserts.</summary>
    public static IReadOnlyList<int> ForCount(int count)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(count);

        List<int> capacities = new();
        int capacity = 0;
        int stored = 0;

        for (int i = 0; i < count; i++)
        {
            if (stored == capacity)
            {
                // Full (or empty): grow first, then store. The new item is
                // never part of the rehash that made room for it.
                capacity = capacity == 0 ? NextPrimeAtLeast(3) : NextPrimeAtLeast(capacity * 2);
                capacities.Add(capacity);
            }

            stored++;
        }

        return capacities;
    }

    /// <summary>Entries rehashed across the resizes: every capacity but the last.</summary>
    public static int EntryCopies(int count)
    {
        IReadOnlyList<int> capacities = ForCount(count);
        int copies = 0;
        for (int i = 0; i < capacities.Count - 1; i++)
        {
            copies += capacities[i];
        }

        return copies;
    }

    /// <summary>What new Dictionary(count) sizes to: one table, no copies.</summary>
    public static int WithCapacity(int count)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(count);
        return count == 0 ? 0 : NextPrimeAtLeast(count);
    }

    public static (int Resizes, int EntryCopies) SavedBy(int count)
    {
        IReadOnlyList<int> capacities = ForCount(count);
        int resizes = Math.Max(capacities.Count - 1, 0);
        return (resizes, EntryCopies(count));
    }
}
