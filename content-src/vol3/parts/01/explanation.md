# Reading - csharp/v3cc01_gc_generations

## Notes

**The collector runs when you allocate, not when time passes.** The allocator
hands out memory by bumping a pointer inside the current gen0 allocation
context. When the budget for that context is exhausted, the next allocation
triggers a gen0 collection. There is no timer and no periodic sweep. So "my
service pauses every few seconds" is really "my service allocates a gen0
budget every few seconds", and the fix is upstream of any GC setting.

**A collection costs what survives.** Mark-and-compact copies live objects and
fixes up the references to them; dead objects are never touched. This inverts
the intuition from `malloc`/`free`, where freeing costs per object. It is why
a tight loop producing millions of dead temporaries can be fine, and a cache
of a million live objects can be expensive on every gen2 pass even when
nothing in it has changed.

**Gen0 is roughly a CPU cache's worth of memory.** The exact budget is dynamic
and adapts to your behaviour, but the design intent is that a gen0 collection
touches memory that is still hot. Two consequences: allocating small and dying
young stays in cache, and objects that survive get copied to a colder address,
which is a second cost after the copy itself.

**The large object heap is different in three ways.** Anything at or over
85,000 bytes goes there, it is collected only with gen2, and it is not
compacted by default — the runtime keeps a free list instead, so it can
fragment. `GCSettings.LargeObjectHeapCompactionMode` exists to compact it on
demand and is a blunt instrument. Arrays that oscillate around the threshold,
sized from request data, are the classic fragmentation source, and
`ArrayPool` exists largely for them.

**Pinning is fragmentation.** A pinned object — a `fixed` block, an interop
buffer, `GCHandle.Alloc(..., GCHandleType.Pinned)` — cannot be moved by the
compactor, so the collector must work around it. Short pins are fine; a
long-lived pinned buffer sitting in gen0 is a hole the allocator routes around
forever. .NET 5 added the pinned object heap so long-lived pinned buffers can
be segregated deliberately.

**Server GC is not "better".** Workstation GC uses one heap and background
collection tuned for latency. Server GC allocates a heap and a dedicated
collection thread per core, which raises throughput and raises memory use, and
in a container with a low CPU limit it can be actively harmful.
`ServerGarbageCollection` is a deployment decision to measure, not a default
to copy.

## ex1

Really testing: that you can attach a number to an opinion.
`GC.GetAllocatedBytesForCurrentThread` is a running per-thread total, so a
before/after difference is exact and covers everything the delegate did on
that thread. The classic mistake is reaching for a stopwatch instead and
concluding nothing, because at 200 iterations both versions are sub-millisecond
and the timing is noise while the allocation gap is a clean order of
magnitude. The second mistake is forgetting that `+=` on a string allocates
twice per iteration — the `int.ToString()` and a fresh concatenated string
whose size grows with the loop — which is why the naive figure is quadratic in
`count` while the builder's is linear.

## ex2

Really testing: the cumulative rule. `GC.CollectionCount(n)` counts
collections of generation n *or higher*, so a gen2 collection increments all
three counters. `Gen0 >= Gen1 >= Gen2` therefore always holds, and a delta that
violates it means you read the counters in the wrong order or on the wrong
side of the work. The classic mistake is reporting "two gen1 collections and
zero gen0 collections" and building a conclusion on it. Note also what the
numbers cannot tell you: they count collections, not pause time, and most of a
background gen2 collection runs concurrently with your threads.

## ex3

Really testing: what a weak reference actually promises. `WeakReference<T>`
holds a GC handle that does not count as a root, so the target can be
collected while your dictionary entry survives — which means the entry itself
is the leak if you never trim. `TryGetTarget` is the only correct read: it
takes a strong reference for the duration of the call, so the value cannot be
collected between your check and your use. The classic mistake is an
`IsAlive`-then-`Target` pair, which is a race the runtime is allowed to make
you lose. The gate can only be deterministic because it drops its own strong
references and calls `GC.Collect()`; in production "when" is unknowable, which
is exactly the property a cache wants and a work queue does not.

## ex4

Really testing: that 85,000 bytes is a size of the *allocation*, not of your
payload. On 64-bit an array carries an object header word, a method table
pointer and a length field ahead of the elements, so `int[21248]` is already
over the line even though 21248 x 4 = 84,992. The classic mistake is sizing a
buffer at exactly `85000 / sizeof(T)` and landing on the LOH anyway. The
second is assuming the LOH is slow to allocate: it is not especially, it is
slow to *collect*, because it goes only with gen2 and is not compacted.

## ex5

Really testing: boxing as an allocation you did not type. Every `int` handed
to an `object`-typed parameter becomes a 24-byte heap object on 64-bit — header,
method table pointer, payload, alignment. Over a million elements that is 24 MB
of pure garbage. The generic version with `where T : INumber<T>` is
monomorphised by the JIT for each value type, so the arithmetic happens in
registers and nothing is allocated. The classic mistake is believing generics
alone fix it: a constraint of the non-generic `IComparable` boxes on every
comparison, and so does any interface call made through an interface-typed
variable rather than a constrained generic parameter.

## ex6

Really testing: the pool contract. `ArrayPool<T>.Shared.Rent(n)` returns an
array of *at least* n elements — usually the next power of two — holding
whatever the previous tenant left in it. So you track your own length, you
never treat `buffer.Length` as the payload size, and you return in a `finally`
so an exception does not shrink the pool permanently. The classic mistake is
`Return(buffer, clearArray: false)` for a buffer that held secrets, or worse,
keeping a reference to the buffer after returning it — a use-after-free with a
managed accent: two pieces of code writing one array, no exception, corrupt
data.

## ex7

Really testing: why a finalizer costs even when it never runs. A type with a
finalizer is registered on the finalization queue at allocation, cannot be
reclaimed in the gen0 pass that first finds it unreachable — the finalizer
thread must run first — and therefore survives into gen1 or gen2. That is a
guaranteed midlife crisis for every instance. `GC.SuppressFinalize(this)` in
`Dispose` takes it back off the queue, which is why the pattern insists on it.
The classic mistake is a finalizer on a type that owns only managed objects:
it buys nothing, because those objects are collectible anyway, and it makes
every instance more expensive. Modern guidance is to own unmanaged resources
through `SafeHandle` and write no finalizer at all.

## ex8

Really testing: slicing without copying. `ReadOnlySpan<char>` over a string is
a reference and a length; `IndexOf`, `Slice` and comparisons on it allocate
nothing, and `ToString()` at the very end is the one allocation you chose to
make. The classic mistake is `text.Split(';')` at the top of the method, which
allocates an array plus a string per pair before you have decided you need any
of them. The second is trying to store a span in a field or capture it in a
lambda: it is a `ref struct` and the compiler refuses, deliberately — spans are
stack-only so they cannot outlive the memory they view.

## Further reading

- [Fundamentals of garbage collection](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals) - generations, budgets, the LOH.
- [The large object heap](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap) - the 85,000-byte threshold and fragmentation.
- [ArrayPool&lt;T&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.buffers.arraypool-1) - Rent, Return, and the "at least" contract.
- [Cleaning up unmanaged resources](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/unmanaged) - finalizers, SuppressFinalize, SafeHandle.
- [Memory&lt;T&gt; and Span&lt;T&gt; usage guidelines](https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/memory-t-usage-guidelines) - what a ref struct may and may not do.
- [Workstation and server GC](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/workstation-server-gc) - the deployment decision.
