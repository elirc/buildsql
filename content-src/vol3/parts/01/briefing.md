# V3·C1 — The GC, generations, and allocation pressure you can see

You have been allocating since your first `new`. Every list you grew, every
string you concatenated, every LINQ chain that materialised a lambda closure
put bytes on the managed heap, and something quietly took them away again. In
the earlier sectors that was the right level of ignorance: correctness first.
This sector removes it. Not so you can "tune the GC" — you almost never
should — but because the size of your programs' allocation rate is a number you
control, and it is the number behind most of the .NET performance work that
actually pays.

The mental model to throw away is "the GC runs every so often". It does not
run on a timer. It runs when an *allocation* cannot be satisfied from the
current gen0 allocation budget. Your code decides when collections happen, by
allocating. That is the whole causal chain, and it is why "reduce allocations"
and "reduce GC time" are the same sentence.

## Generations, in the only detail you need

The .NET heap is generational because of one empirical observation: most
objects die young. So the collector splits the heap into gen0 (just born),
gen1 (survived one collection), gen2 (survived two, i.e. everything long
lived), plus a separate large object heap for anything at or over 85,000
bytes.

A gen0 collection walks the roots — statics, locals on every thread's stack,
GC handles — finds what is reachable, and *copies the survivors* into gen1.
Nothing is done to the garbage at all. That is the trick: a gen0 collection
costs time proportional to what *survived*, not to what died. A million dead
temporary strings cost the collector nothing. One live cache holding a million
objects costs on every gen2 pass.

Two consequences follow, and they are the ones interviewers are actually
listening for:

- Short-lived garbage is close to free. Allocating a temporary in a loop is
  not automatically a bug.
- Objects that survive gen0 but die shortly afterwards — the *midlife crisis* —
  are the expensive ones, because you paid to copy them and then threw them
  away. Buffers held just slightly too long, caches with no eviction, objects
  parked in a queue for a second: that is where the cost is.

```csharp
long before = GC.GetAllocatedBytesForCurrentThread();
DoWork();
long allocated = GC.GetAllocatedBytesForCurrentThread() - before;
```

That single API is the most useful measurement in this sector. It is a running
total maintained by the allocator on the current thread; it does not force a
collection, does not need a profiler, and is exact rather than sampled.

## The other two numbers

`GC.CollectionCount(0)` tells you how many gen0 collections have happened
since the process started. Take it before and after a workload and you have
collections per operation. Note the rule that trips people: a gen2 collection
is also a gen1 and a gen0 collection, so the counts are cumulative upward — if
`CollectionCount(2)` went up by one, `CollectionCount(0)` went up by at least
one too.

`GC.GetTotalAllocatedBytes(precise: true)` is the process-wide version of the
first API. Use the per-thread one in tests: it is not perturbed by whatever
the runtime's background threads are doing.

## Exercise 1 - measuring what a delegate allocates

Edit `src/Lessons/V3CC01_GcGenerations/Ex1.cs`. Implement
`AllocationProbe.BytesFor(Action work)` returning the bytes allocated on the
calling thread by `work`, and `AllocationProbe.CompareBuilders(int count)`
returning `(long Naive, long Builder)` for two ways of joining `count`
numbers: `result += i.ToString()` in a loop, versus a `StringBuilder`.

For `count = 200` the naive figure is tens of kilobytes and the builder
figure is under two. The gate asserts the ratio, not the exact bytes.

```
uv run dojo test csharp v3cc01_gc_generations ex1
```

## Exercise 2 - counting collections, cumulatively

Edit `src/Lessons/V3CC01_GcGenerations/Ex2.cs`. `CollectionWatch.Measure`
captures `GC.CollectionCount` for all three generations either side of an
action and returns a `CollectionDelta(int Gen0, int Gen1, int Gen2)`. Then
implement `CollectionDelta.IsConsistent()`, which encodes the cumulative rule:
`Gen0 >= Gen1 >= Gen2`.

```
uv run dojo test csharp v3cc01_gc_generations ex2
```

## Exercise 3 - a cache that lets go

Edit `src/Lessons/V3CC01_GcGenerations/Ex3.cs`. `WeakCache<TKey, TValue>` maps
keys to `WeakReference<TValue>`. `TryGet` answers false both when the key is
absent and when the target has been collected; `Trim()` removes dead entries
and returns how many it dropped. The gate drops its strong references, forces
a collection, and expects the cache to admit the values are gone.

```
uv run dojo test csharp v3cc01_gc_generations ex3
```

## Exercise 4 - the 85,000-byte cliff

Edit `src/Lessons/V3CC01_GcGenerations/Ex4.cs`. `HeapPlanner.ArrayBytes(int
elementSize, int length)` computes the 64-bit managed size of an array —
object header plus method table pointer plus length field plus payload,
rounded up to an 8-byte boundary — and `HeapPlanner.Destination(...)` returns
`"LOH"` at or above 85,000 bytes and `"Gen0"` below. Then
`HeapPlanner.MaxElementsInGen0(int elementSize)` answers the practical
question: how many elements fit before you fall off the cliff.

```
uv run dojo test csharp v3cc01_gc_generations ex4
```

## Exercise 5 - the allocation you did not write

Edit `src/Lessons/V3CC01_GcGenerations/Ex5.cs`. `Totals.SumBoxing` takes
`IEnumerable<object>` and unboxes; `Totals.SumGeneric<T>` takes
`IEnumerable<T>` where `T : INumber<T>` and never boxes. Both must produce the
same answer; the gate measures the bytes each allocates and requires the
generic path to be dramatically cheaper.

```
uv run dojo test csharp v3cc01_gc_generations ex5
```

## Exercise 6 - renting instead of allocating

Edit `src/Lessons/V3CC01_GcGenerations/Ex6.cs`. `ChunkCopier.CopyThrough`
copies a source array into a destination through a rented buffer of at least
`chunkSize` bytes, returning the buffer in a `finally` and never trusting
`buffer.Length` — the pool may hand you a bigger array than you asked for.

```
uv run dojo test csharp v3cc01_gc_generations ex6
```

## Exercise 7 - the most expensive keyword in a type declaration

Edit `src/Lessons/V3CC01_GcGenerations/Ex7.cs`. `TrackedHandle` owns a fake
unmanaged handle, implements the dispose pattern with a finalizer, and appends
to a shared log so the gate can see *what ran, in what order*. Disposing must
record `"dispose:managed"` and suppress the finalizer; abandoning the object
must record `"finalize"` after a forced collection.

```
uv run dojo test csharp v3cc01_gc_generations ex7
```

## Exercise 8 - parsing without the garbage

Edit `src/Lessons/V3CC01_GcGenerations/Ex8.cs`. `SettingsReader.FindValue`
finds one key's value in a `"a=1;b=2;c=3"` string using `ReadOnlySpan<char>`
slicing, allocating at most one string — the answer — and nothing when the key
is absent. `CountPairs` counts entries while allocating nothing at all.

```
uv run dojo test csharp v3cc01_gc_generations ex8
```

## Challenge

`BatchProcessor.Run` puts three ideas together: a pooled buffer, span-based
parsing, and a measured allocation budget. It processes a batch of records
and reports the bytes it allocated and the gen0 collections it caused, and the
gate holds it to a per-record budget that a naive `Split`-and-`ToList`
implementation blows through immediately.

## Review

`review1` comes at generations from the other side: a small simulator. You
implement the promotion rule and the budget rule that decide when the runtime
collects and what moves up, then answer one weak-reference question with it.
Building the collector is the fastest way to stop guessing about it.
