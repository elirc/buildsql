# V3·C1 — The GC, generations, and allocation pressure you can see

## Why this sector exists

There are two ways to talk about the .NET garbage collector. One is folklore:
"the GC handles memory", "call `GC.Collect()` to free memory", "structs are
faster". The other is arithmetic: this operation allocates 4.2 KB, at 10,000
requests per second that is 42 MB/s of gen0 traffic, gen0's budget is a few
megabytes, so we are causing roughly ten collections a second, each costing
what survives. Only the second kind of talk leads anywhere. This sector is
about producing those numbers on your own machine, in a unit test, without a
profiler.

## The model

The managed heap is a bump allocator with a generational collector on top.

- **Allocation** is a pointer increment inside a thread-local allocation
  context, plus zeroing. That is why "allocation is cheap in .NET" is true and
  misleading in the same breath: allocation is cheap, *collection* is the bill.
- **Gen0** holds new objects. When the gen0 budget is exhausted, the next
  allocation triggers a collection: roots are traced, survivors are copied
  into gen1, gen0 resets to empty.
- **Gen1** is a buffer zone. Survivors of a gen1 collection go to gen2.
- **Gen2** is everything long lived, collected rarely, and expensive because
  it traces the whole graph.
- **The LOH** takes allocations of 85,000 bytes or more, is collected only
  with gen2, and is not compacted by default.

Two rules follow directly and are worth memorising as sentences you can say
out loud in a review:

1. A collection costs time proportional to what survives, not to what died.
2. The worst object is the one that survives gen0 and then dies — you paid the
   copy for nothing.

## Measuring, three ways

```csharp
// 1. Bytes, exactly, on this thread. No profiler needed.
long before = GC.GetAllocatedBytesForCurrentThread();
Work();
long bytes = GC.GetAllocatedBytesForCurrentThread() - before;

// 2. Collections, cumulative upward.
int g0 = GC.CollectionCount(0), g1 = GC.CollectionCount(1);
Work();
int gen0 = GC.CollectionCount(0) - g0;   // includes gen1 and gen2 passes

// 3. Whole-process totals, useful in a service, noisy in a test.
long total = GC.GetTotalAllocatedBytes(precise: true);
GCMemoryInfo info = GC.GetGCMemoryInfo();   // pause durations, heap sizes
```

`GetGCMemoryInfo().PauseDurations` is the one people miss. It gives you the
actual pause times of recent collections, which is what a latency SLO cares
about — far more useful than a collection count.

## Worked example: where the bytes come from

```csharp
public static string JoinNaive(int count)
{
    string result = "";
    for (int i = 0; i < count; i++) result += i.ToString();   // two allocs, growing
    return result;
}

public static string JoinBuilder(int count)
{
    var sb = new StringBuilder();
    for (int i = 0; i < count; i++) sb.Append(i);             // Append(int) does not
    return sb.ToString();                                     // allocate a string
}
```

At `count = 200` the first allocates roughly 60 KB and the second under 2 KB.
The interesting part is not the ratio, it is the shape: the naive version is
O(n^2) in bytes because every `+=` copies the whole accumulated string. Double
the count and the gap quadruples. Note also `sb.Append(i)` rather than
`sb.Append(i.ToString())`: the integer overload formats straight into the
builder's buffer, so the intermediate string never exists.

## Worked example: the boxing you did not type

```csharp
static long SumBoxing(IEnumerable<object> values)   // every int is a 24-byte object
{
    long total = 0;
    foreach (object v in values) total += (int)v;
    return total;
}

static T SumGeneric<T>(IEnumerable<T> values) where T : INumber<T>
{
    T total = T.Zero;
    foreach (T v in values) total += v;             // no boxing: JIT specialises
    return total;
}
```

Generic math (`INumber<T>`, .NET 7+) is the modern answer to "I want one
numeric routine for `int`, `long` and `decimal` without boxing". The JIT
compiles a separate body per value type, so `total += v` becomes an `add`
instruction rather than an interface call.

## Worked example: renting

```csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(chunkSize);
try
{
    int taken = Math.Min(chunkSize, remaining);   // NEVER buffer.Length
    source.AsSpan(offset, taken).CopyTo(buffer);
    destination.AsSpan(offset, taken).Clear();
    buffer.AsSpan(0, taken).CopyTo(destination.AsSpan(offset));
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer, clearArray: false);
}
```

Three rules, all of them learned the hard way by somebody:

- `Rent(n)` gives you **at least** n. Track your own length.
- Return in a `finally`, or a thrown exception permanently shrinks the pool.
- After `Return`, the array is not yours. Holding a reference to it is the
  managed equivalent of use-after-free, and it fails silently.

## Common mistakes

- **Calling `GC.Collect()` in production code.** It forces a blocking gen2
  collection, which is the most expensive thing the runtime does, and it
  discards the collector's tuning history. The legitimate uses are a test that
  needs determinism, and a genuine "the process has just finished a huge phase
  and will now idle" moment. That is the whole list.
- **Believing structs never allocate.** A struct in a `List<T>` lives in the
  list's array, on the heap. A struct captured in a lambda lives in a closure
  object, on the heap. A struct cast to an interface is boxed, on the heap.
- **Sizing buffers just under 85,000 bytes** without accounting for the array
  header, and landing on the LOH.
- **Adding a finalizer "just in case".** You have made every instance survive
  an extra generation and added a queue hop, in exchange for nothing.
- **Using `WeakReference` as a memory-pressure valve for things you actually
  need.** A weak cache is a cache whose entries vanish at times you cannot
  predict; if a miss is expensive and unbounded, you wanted a size-bounded
  strong cache instead.
- **Reading `GC.GetTotalMemory(false)` and treating it as "memory used".** It
  is the managed heap's approximate size at that moment, excludes native
  memory entirely, and moves under you.

## Interview answer

*"How does the .NET garbage collector work?"* — Answer in four sentences and
stop. It is a generational, tracing, mark-and-compact collector. Allocation is
a pointer bump in gen0; when gen0's budget is exhausted the next allocation
triggers a collection, which traces from the roots — statics, stack slots, GC
handles — and copies survivors into the next generation, so the cost is
proportional to what lives, not to what died. Gen2 and the large object heap
are collected together and rarely, and the LOH is not compacted by default,
which is why buffers of 85,000 bytes or more want pooling. The practical
consequence is that you control GC time by controlling allocation rate and
object lifetime, not by calling `GC.Collect()`.

If they push further, the differentiating detail is the *midlife crisis*:
objects that survive gen0 and then die are the expensive ones, so the fix for
a service with high gen1 promotion is usually to shorten a lifetime — a buffer
held across an await, a per-request object parked in a queue — rather than to
allocate less overall.

## Check yourself

1. What triggers a gen0 collection?
2. Why is a gen0 collection's cost proportional to survivors rather than to
   garbage?
3. `GC.CollectionCount(2)` increased by 1. What is the minimum you know about
   `GC.CollectionCount(0)`?
4. An `int[]` of what length is the first to land on the LOH on 64-bit?
5. Give three ways a `struct` ends up on the heap.
6. What exactly does `GC.SuppressFinalize(this)` do, and what breaks if you
   omit it from a `Dispose` on a finalizable type?
7. Why does a type with a finalizer survive longer than an equivalent type
   without one, even if the finalizer body is empty?
8. `ArrayPool.Rent(1000)` returned an array with `Length == 1024`. Name two
   bugs that follow from using `Length` as your payload size.
9. When is `WeakReference<T>` the right tool, and when is it a way to make a
   cache miss unpredictable?
10. Why can a `Span<T>` not be a field of a class?
11. What does `GC.GetAllocatedBytesForCurrentThread` include that
    `GC.GetTotalMemory` does not tell you?
12. Your service's p99 latency has periodic spikes. Which single GC number
    would you look at first, and why not collection counts?
13. Why is server GC sometimes worse than workstation GC in a container?
14. What is the midlife crisis, and what code change usually fixes it?
