# Long reading - the collector as a cost you author

## The bargain

Automatic memory management is a trade: you give up control of *when* memory
is reclaimed, and in exchange you stop writing use-after-free bugs. The .NET
implementation of that trade is unusually aggressive. It does not reference
count, it does not free objects individually, and it moves your objects behind
your back. Understanding why it made those choices is most of what you need to
predict its behaviour.

Reference counting — the Python and CPython-adjacent approach, and COM's — pays
a small cost on every assignment, cannot collect cycles without a backup
tracer, and gives you deterministic destruction. Tracing pays nothing on
assignment, collects cycles for free, and gives you no determinism at all.
.NET chose tracing, then bolted determinism back on for the cases that need it
via `IDisposable`, which is why the next sector exists.

Having chosen tracing, the runtime chose *compacting* tracing: survivors are
copied so the live objects end up contiguous. That is what makes allocation a
pointer bump rather than a free-list search, and it is what makes object
addresses unstable — hence `fixed`, `GCHandle`, and the whole pinning story.

## The generational hypothesis, and the evidence for it

The generational design rests on a claim: most objects die young. It is not a
theoretical claim, it was measured, repeatedly, across languages, from the
early Lisp and Smalltalk collectors onward. Typical server workloads confirm
it brutally: the vast majority of a request's allocations are dead by the time
the response is written.

If most objects die young, then a collector that examines only the young
objects reclaims most of the garbage for a fraction of the work. That is gen0.
The complication is that an old object can hold a reference to a young one —
a cache entry pointing at a freshly parsed value — so tracing only gen0 could
collect something that is genuinely reachable.

The runtime solves this with **write barriers** and a **card table**. Every
reference-typed field assignment compiles to a store plus a tiny barrier that
marks a "card" — a small region of the heap — as dirty. When gen0 is collected,
the collector scans dirty cards in the older generations for references into
gen0 and treats them as roots. You pay a few instructions on every reference
store, forever, so that gen0 collections can stay short. That is the actual
price of the generational design, and it is one of the reasons writing to a
reference field is measurably more expensive than writing to an `int` field.

## What a collection does, in order

1. **Suspend.** Managed threads are brought to a safe point. This is
   cooperative, not preemptive — the JIT emits polls, which is why a tight loop
   with no allocation and no calls used to be able to delay a collection.
2. **Mark.** From the roots — statics, each thread's stack and registers, GC
   handles, the finalization queue — trace reachable objects and set a bit.
3. **Plan and relocate.** Decide new addresses for survivors, compacting away
   the gaps.
4. **Update references.** Every reference pointing at a moved object is
   rewritten. This is why pinned objects hurt: they cannot move, so the plan
   has to work around them.
5. **Resume**, and reset gen0's allocation pointer to the start.

Background gen2 collection overlaps most of steps 2-4 with your running
threads, using short suspensions rather than one long one. That is why the
number of collections is a poor proxy for pause time, and why
`GC.GetGCMemoryInfo().PauseDurations` is the honest metric.

## Numbers worth carrying

These are order-of-magnitude figures for 64-bit .NET 8 on a typical x64
server. They vary; the ratios do not.

- Object header plus method table pointer: **16 bytes** on every reference
  type instance. An "empty" class costs 24 bytes after alignment.
- A boxed `int`: **24 bytes**. A boxed `long`: 24. A boxed `Guid`: 32.
- An array adds a **length field**: `new byte[n]` costs roughly `24 + n`,
  rounded up to 8.
- The LOH threshold: **85,000 bytes**, configurable via
  `GCLOHThreshold` but almost never worth changing.
- A gen0 collection: typically **tens of microseconds** to a few hundred.
- A blocking gen2 collection on a multi-gigabyte heap: **tens to hundreds of
  milliseconds**. This is the thing your p99 is made of.
- `GC.GetAllocatedBytesForCurrentThread`: two reads and a subtraction,
  effectively free, safe to call inside a benchmark's setup.

## Where the cost actually shows up in a service

The failure mode that dominates real .NET services is not "too much garbage".
It is **promotion**. Something allocated per request survives long enough to
be copied into gen1 or gen2 — because it was held across an `await`, because it
went into a queue, because a closure captured it, because it was cached
briefly. Each survivor costs a copy plus a reference fix-up, and gen1's
survivors then cost again on promotion to gen2, where they must wait for the
rare and expensive full collection.

The diagnostic instinct that works: when gen0 counts are high but gen1 and
gen2 counts are near zero, the allocation rate is high and harmless — reduce
it if you want throughput, but it is not a latency problem. When gen1 and
especially gen2 counts climb, something is *surviving* that should not, and
the fix is a lifetime change, not a micro-optimisation. Chasing bytes when the
problem is lifetime is the most common wasted week in .NET performance work.

## Pooling, and its honest cost

`ArrayPool<T>` and `ObjectPool<T>` swap GC cost for bookkeeping and risk. The
buffer you rent is not zeroed unless you ask, so you can leak a previous
tenant's data. The buffer you return must genuinely not be referenced any
more, and the compiler cannot help you check that. And a pooled object that is
long lived is by definition a gen2 object holding references to whatever you
left in it.

The rule that survives contact with production: pool **large, uniform,
short-lived buffers on a hot path you have measured**. Do not pool small
objects — the allocator beats you — and do not pool because it feels
disciplined. `RecyclableMemoryStream` and the ASP.NET Core pipelines exist
because HTTP body buffers meet that description exactly, and most application
code does not.

## When not to care

Most code should allocate freely and be readable. The generational collector
exists precisely so that the temporary list, the LINQ chain and the interpolated
string are affordable. The point at which allocation becomes a design input is
narrow and identifiable: a loop that runs millions of times, a request path at
high RPS, a latency SLO with a tight p99, or a memory-constrained container. If
you are not in one of those, `Span<T>` gymnastics buys you nothing and costs
readability, and reviewers should say so.

The corollary is that you should be able to *tell* which situation you are in,
with a number. That is what this sector's exercises are for: not to make you
allocation-averse, but to make you allocation-literate, so that "this allocates
too much" becomes a claim with a measurement attached rather than a taste.

## A note on `GC.Collect()`

There is a reason it is on every "code smell" list. Forcing a collection is a
blocking, full-heap operation that also resets the tuning heuristics the
collector has built up about your workload; the next several collections are
worse than they would have been. The defensible uses are: a test that needs
deterministic finalization or weak-reference behaviour, a benchmark harness
between iterations, and a genuine phase change in a long-running process — an
import finished, a level unloaded, the process is about to idle. Everything
else is superstition, and it is usually covering for a lifetime bug that the
collection does not fix.
