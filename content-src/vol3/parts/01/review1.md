@@PROMPT@@
## Review 1 - build the collector, then you will stop guessing

Edit `src/Lessons/V3CC01_GcGenerations/Review1.cs`. Same ideas, opposite
direction: instead of measuring a collector, you implement one.

`GenerationalHeap(int gen0Budget, int gen1CollectionEvery)` models three
generations. Reachability is simplified to roots only — no object graph.

- `Allocate(string id, int bytes)` — puts a new object in gen0. If it would
  push gen0 past its budget, a gen0 collection runs **first**, then the object
  is allocated. Allocating an id that already exists throws
  `ArgumentException`.
- `Root(string id)` / `Unroot(string id)` — add or remove a strong root.
  Objects are allocated rooted.
- `Watch(string id)` — register a weak handle. A weak handle never keeps an
  object alive.
- `Collect(int generation)` — collects generations `0 .. generation`. Rooted
  objects in those generations survive and are promoted by one generation,
  capped at 2; unrooted ones are removed. Every collection adds the surviving
  bytes to `BytesCopied` — the cost model of a copying collector.
- Automatic escalation: every `gen1CollectionEvery`-th automatic gen0
  collection is a gen1 collection instead.
- `Gen0Bytes`, `Gen1Bytes`, `Gen2Bytes`, `Collections0`, `Collections1`,
  `Collections2`, `BytesCopied` — the counters.
- `int ClearDeadWatches()` — drops weak handles whose object is gone and
  returns how many. `bool IsAlive(string id)`.

```
var heap = new GenerationalHeap(gen0Budget: 100, gen1CollectionEvery: 3);
heap.Allocate("a", 40); heap.Allocate("b", 40);
heap.Unroot("b");
heap.Allocate("c", 40);          // 120 > 100, so a gen0 collection runs first
heap.Collections0                // 1
heap.IsAlive("b")                // false - unrooted when the collection ran
heap.Gen1Bytes                   // 40 - "a" survived and was promoted
heap.Gen0Bytes                   // 40 - "c", allocated after the collection
heap.BytesCopied                 // 40
```

Then answer the weak-reference question in code:
`GenerationalHeap.SurvivesWith(bool rooted, bool watched)` returns whether an
object with those two properties survives a collection — the one-line summary
of what a `WeakReference` does and does not promise.

```
uv run dojo test csharp v3cc01_gc_generations review1
```
@@HINTS@@
## Hint 1

Model an object as a small record — id, bytes, generation, rooted — in a
dictionary keyed by id. Then a collection is one pass: partition the objects
in the collected generations into survivors and casualties, promote the
survivors, delete the casualties, add the survivors' bytes to `BytesCopied`.

## Hint 2

Promotion, capped:

```csharp
obj.Generation = Math.Min(obj.Generation + 1, 2);
```

and the generation totals are derived rather than stored: sum the bytes of
objects whose generation matches. Deriving them means one fewer thing to keep
in sync, and the sums are small.

## Hint 3

The ordering in `Allocate` is the part the gate probes hardest: check the
budget against the *current* gen0 bytes, collect if the new object would
exceed it, and only then add — so the new object never participates in the
collection that made room for it. That is what the real allocator does, and
getting it backwards makes brand-new objects mysteriously get promoted. You
decide whether a single object larger than the whole budget is an error or an
allocation that simply proceeds; say why.
@@IMPORTANT@@
## Hint 1

Everything in this sector was one claim: a collection costs what survives.
Your `BytesCopied` counter is that claim made executable. Before you write the
class, predict what `BytesCopied` should be after a workload that allocates
ten megabytes of immediately-dead objects — the answer is zero, and your
implementation has to agree.

## Hint 2

Two counters that are easy to get wrong. `Collections0` counts collections of
generation 0 *or higher*, exactly like `GC.CollectionCount(0)` — so a gen1
collection increments both `Collections0` and `Collections1`. And the
escalation counter counts *automatic* collections triggered by allocation, not
explicit `Collect` calls.

## Hint 3

`SurvivesWith` is deliberately trivial to write and the point is what it says:
a weak handle contributes nothing to survival, so the answer depends on
`rooted` alone. Where the weak handle does matter is `ClearDeadWatches` — the
handle outlives its object and is the entry that leaks if nobody trims it,
which is exactly the bug ex3 was built around.
@@REF@@
// v3cc01_gc_generations / review1 - build the collector, then you will stop guessing.
// See lessons/v3cc01_gc_generations/README.md, "Review 1".

namespace CSharpDojo.V3CC01_GcGenerations;

/// <summary>
/// A three-generation copying collector, small enough to hold in your head.
/// Reachability is roots only: no object graph, which is the one thing this
/// model leaves out.
/// </summary>
public sealed class GenerationalHeap
{
    private sealed class Entry
    {
        public required string Id { get; init; }
        public required int Bytes { get; init; }
        public int Generation { get; set; }
        public bool Rooted { get; set; }
    }

    private readonly Dictionary<string, Entry> objects = new();
    private readonly HashSet<string> watches = new();
    private readonly int gen0Budget;
    private readonly int gen1CollectionEvery;
    private int automaticCollections;

    public GenerationalHeap(int gen0Budget, int gen1CollectionEvery)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(gen0Budget, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(gen1CollectionEvery, 1);

        this.gen0Budget = gen0Budget;
        this.gen1CollectionEvery = gen1CollectionEvery;
    }

    public int Gen0Bytes => BytesIn(0);

    public int Gen1Bytes => BytesIn(1);

    public int Gen2Bytes => BytesIn(2);

    public int Collections0 { get; private set; }

    public int Collections1 { get; private set; }

    public int Collections2 { get; private set; }

    public long BytesCopied { get; private set; }

    public void Allocate(string id, int bytes)
    {
        ArgumentException.ThrowIfNullOrEmpty(id);
        ArgumentOutOfRangeException.ThrowIfNegative(bytes);

        if (objects.ContainsKey(id))
        {
            throw new ArgumentException($"'{id}' is already allocated", nameof(id));
        }

        // Collect BEFORE adding, so the new object is never part of the
        // collection that made room for it. An object bigger than the whole
        // budget still proceeds - it gets its own collection and then fits or
        // does not, exactly as a real allocator would over-run its budget.
        if (Gen0Bytes + bytes > gen0Budget)
        {
            automaticCollections++;
            Collect(automaticCollections % gen1CollectionEvery == 0 ? 1 : 0);
        }

        objects[id] = new Entry { Id = id, Bytes = bytes, Generation = 0, Rooted = true };
    }

    public void Root(string id) => Find(id).Rooted = true;

    public void Unroot(string id) => Find(id).Rooted = false;

    public void Watch(string id)
    {
        ArgumentException.ThrowIfNullOrEmpty(id);
        watches.Add(id);
    }

    public bool IsAlive(string id) => objects.ContainsKey(id);

    /// <summary>
    /// Collects generations 0..generation. Survivors are promoted; the bytes
    /// they occupy are the cost, because a copying collector moves them.
    /// </summary>
    public void Collect(int generation)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(generation);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(generation, 2);

        List<string> dead = new();
        long copied = 0;

        foreach (Entry entry in objects.Values)
        {
            if (entry.Generation > generation)
            {
                continue;
            }

            if (entry.Rooted)
            {
                entry.Generation = Math.Min(entry.Generation + 1, 2);
                copied += entry.Bytes;
            }
            else
            {
                dead.Add(entry.Id);
            }
        }

        foreach (string id in dead)
        {
            objects.Remove(id);
        }

        BytesCopied += copied;

        // Cumulative upward, exactly like GC.CollectionCount.
        Collections0++;
        if (generation >= 1)
        {
            Collections1++;
        }

        if (generation >= 2)
        {
            Collections2++;
        }
    }

    /// <summary>Drops weak handles whose object is gone.</summary>
    public int ClearDeadWatches()
    {
        List<string> gone = watches.Where(id => !objects.ContainsKey(id)).ToList();
        foreach (string id in gone)
        {
            watches.Remove(id);
        }

        return gone.Count;
    }

    /// <summary>
    /// What a weak reference promises, in one line: nothing. Survival depends
    /// on being rooted; watching only tells you afterwards.
    /// </summary>
    public static bool SurvivesWith(bool rooted, bool watched) => rooted;

    private int BytesIn(int generation) =>
        objects.Values.Where(e => e.Generation == generation).Sum(e => e.Bytes);

    private Entry Find(string id)
    {
        ArgumentException.ThrowIfNullOrEmpty(id);
        return objects.TryGetValue(id, out Entry? entry)
            ? entry
            : throw new KeyNotFoundException($"'{id}' is not allocated");
    }
}
