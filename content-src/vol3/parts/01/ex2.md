@@PROMPT@@
## Exercise 2 - counting collections, cumulatively

Edit `src/Lessons/V3CC01_GcGenerations/Ex2.cs`.

`CollectionWatch.Measure(Action work)` captures `GC.CollectionCount` for
generations 0, 1 and 2 either side of `work` and returns a
`CollectionDelta(int Gen0, int Gen1, int Gen2)` of the differences.

`CollectionDelta.IsConsistent()` returns whether the deltas obey the rule the
runtime guarantees: `Gen0 >= Gen1 >= Gen2`, and no member is negative.

`CollectionWatch.Describe(CollectionDelta delta)` renders the deltas for a log
line: `"gen0=3 gen1=1 gen2=0"`, or `"no collections"` when all three are zero.

```
Measure(() => { })                        -> usually (0, 0, 0)
Measure(() => GC.Collect())               -> Gen0 >= 1, Gen1 >= 1, Gen2 >= 1
new CollectionDelta(1, 2, 0).IsConsistent()  -> false
Describe(new CollectionDelta(0, 0, 0))       -> "no collections"
```

The gate forces one full collection and asserts each delta is at least 1 —
never an exact count, because the runtime is allowed to collect whenever it
likes.

```
uv run dojo test csharp v3cc01_gc_generations ex2
```
@@HINTS@@
## Hint 1

Read all three counters before the work and all three after, then subtract
pairwise. Reading them interleaved with the work — gen0 before, gen2 after the
first half — is how you produce a delta that violates the rule and then
disbelieve the rule.

## Hint 2

`GC.CollectionCount(n)` answers "how many collections of generation n or
higher have happened since the process started". So a single full collection
increments all three. A related shape:

```csharp
int before = GC.CollectionCount(2);
GC.Collect();
bool fullHappened = GC.CollectionCount(2) > before;   // true
```

## Hint 3

A `readonly record struct CollectionDelta(int Gen0, int Gen1, int Gen2)` gives
you equality and deconstruction for free, and `IsConsistent` is one boolean
expression over its members. For `Describe`, decide whether "no collections"
means all three deltas are zero or just gen0 — given the cumulative rule, those
two definitions are the same, and being able to say why is the exercise.
@@IMPORTANT@@
## Hint 1

Start from the assertion you want to be able to make in a log: "this request
caused two gen0 collections and no promotion". Which counters do you need, and
what would make that sentence a lie?

## Hint 2

Counts are not pause time. Two gen0 collections at 40 microseconds each are
invisible; one gen2 collection is the spike in your p99. If you want the
latency answer rather than the frequency answer, the API is:

```csharp
GCMemoryInfo info = GC.GetGCMemoryInfo();
TimeSpan lastPause = info.PauseDurations.Length > 0 ? info.PauseDurations[0] : TimeSpan.Zero;
```

## Hint 3

`Measure` must not itself allocate meaningfully before the second read, or you
risk causing the very collection you are counting. Capture the three "after"
values into locals immediately, then build the record from them — the order
matters more than it looks.
@@REF@@
// v3cc01_gc_generations / ex2 - counting collections, cumulatively.
// See lessons/v3cc01_gc_generations/README.md, "Exercise 2".

namespace CSharpDojo.V3CC01_GcGenerations;

/// <summary>
/// Collections observed across a piece of work. Counts are cumulative upward:
/// a gen2 collection is also a gen1 and a gen0 collection.
/// </summary>
public readonly record struct CollectionDelta(int Gen0, int Gen1, int Gen2)
{
    public bool IsConsistent() =>
        Gen0 >= 0 && Gen1 >= 0 && Gen2 >= 0 && Gen0 >= Gen1 && Gen1 >= Gen2;
}

public static class CollectionWatch
{
    public static CollectionDelta Measure(Action work)
    {
        ArgumentNullException.ThrowIfNull(work);

        int before0 = GC.CollectionCount(0);
        int before1 = GC.CollectionCount(1);
        int before2 = GC.CollectionCount(2);

        work();

        // Read all three straight away: anything allocated between the reads
        // could trigger a collection and skew the deltas against each other.
        int after0 = GC.CollectionCount(0);
        int after1 = GC.CollectionCount(1);
        int after2 = GC.CollectionCount(2);

        return new CollectionDelta(after0 - before0, after1 - before1, after2 - before2);
    }

    public static string Describe(CollectionDelta delta) =>
        delta is { Gen0: 0, Gen1: 0, Gen2: 0 }
            ? "no collections"
            : $"gen0={delta.Gen0} gen1={delta.Gen1} gen2={delta.Gen2}";
}
