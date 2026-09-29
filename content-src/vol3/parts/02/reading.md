# Long reading - why the table lies, and what to use instead

## Big-O was designed for a machine that no longer exists

Asymptotic analysis assumes a uniform memory model: every access costs one
unit, wherever it lands. That was roughly true when the analysis was invented.
It has not been true since the mid-1990s. On a current server, an L1 hit is
about 1 nanosecond, an L2 hit 4, an L3 hit 15, and a trip to main memory 80 to
100 — a hundredfold spread that the notation cannot express and that dominates
most collection work.

So the practical model is not "count operations". It is **count memory
transactions, weighted by where they land**. `Array.Copy` of 4 KB is one
streaming operation the prefetcher understands perfectly. A walk over 1,000
linked nodes is 1,000 dependent loads the prefetcher cannot help with, because
each address is only known once the previous load returns. This is why the
"slow" O(n) operation routinely beats the "fast" O(1) one, and it is the single
most useful correction to the textbook you will make this year.

Asymptotics still matter — at n = 10 million, O(n²) is fatal regardless of
locality. The discipline is to know which regime you are in. Below a few
thousand elements, constants and layout decide; above a few hundred thousand,
growth rates decide; in between, measure.

## Inside `Dictionary<TKey, TValue>`

The BCL implementation has been stable in shape for two decades and it repays
knowing.

```
buckets: int[]        // 1-based index into entries, 0 means empty
entries: Entry[]      // { int hashCode; int next; TKey key; TValue value; }
```

A lookup does: `hash = comparer.GetHashCode(key)`, `bucket = hash % size`,
then follow `entries[i].next` from `buckets[bucket] - 1`, comparing
`entries[i].hashCode == hash` before `comparer.Equals`. Two loads land on cold
memory in the common case — one in `buckets`, one in `entries` — which is why a
dictionary lookup is roughly the cost of two cache misses rather than the "one
operation" the table implies.

The details that fall out of this layout:

- The modulo is by a **prime**, which is why capacities are 3, 7, 17, 37, 71,
  163, 353, 761, 1597... A prime modulus spreads poorly-mixed hashes better
  than a power of two would. .NET Core added a fast modulo trick so the divide
  is no longer a stall.
- **Removal creates a free list.** Removed entry slots are chained into a free
  list and reused by the next insert, which is exactly why enumeration order
  stops resembling insertion order after any removal.
- **Hash codes are cached in the entry**, so a resize does not re-invoke your
  `GetHashCode`. It does re-bucket every entry, which is the O(n) part.
- For `string` keys, .NET uses a **randomised** hash seed per process and will
  switch a bucket to a collision-resistant comparer if a chain grows
  suspiciously long — a mitigation for hash-flooding denial of service. Two
  consequences: string hash codes are not stable across processes, so never
  persist them, and a dictionary under attack degrades rather than dying.

## Growth policies, and why doubling is the answer

Doubling gives amortised O(1) append because the total copy work for n
insertions is a geometric series that sums to less than n. Growing by a
constant `k` gives `n²/2k` total copies, which is a genuine O(n²) algorithm
hiding in something that looks like an append loop.

The BCL's choices: `List<T>` starts at 4 and doubles; `Queue<T>` doubles;
`Dictionary` moves to the next prime at least double the current;
`StringBuilder` chains 8,000-character chunks rather than copying, which is why
`StringBuilder` avoids the LOH and a growing `List<byte>` does not.

The growth factor is a memory-versus-copies trade. Doubling can waste up to
half the allocated space; some libraries use 1.5 to reduce that, at the cost of
more copies. .NET picked 2, and then gave you `EnsureCapacity` so you can opt
out of the guessing entirely.

## Set operations are not free

`HashSet<T>` gives you `UnionWith`, `IntersectWith`, `ExceptWith` and
`IsSubsetOf`, and their costs vary more than their names suggest.
`IntersectWith(other)` is O(n) when `other` is a `HashSet` with the same
comparer, because it can probe; when `other` is an arbitrary `IEnumerable` it
may materialise it first. `IsSubsetOf` on an `IEnumerable` counts distinct
elements, which allocates. The rule: when both sides are `HashSet<T>` **with
the same comparer**, the fast paths engage; otherwise, read the source or
measure.

The comparer detail matters more than it sounds. A `HashSet<string>` built with
`StringComparer.OrdinalIgnoreCase` and another built with the default comparer
are, as far as the fast paths are concerned, incompatible, and the operation
silently takes the slow route.

## Concurrency changes the shape of the question

`ConcurrentDictionary` is not "a dictionary that is safe". It is a different
data structure with different guarantees: lock striping for writes, lock-free
volatile reads, and — critically — **no atomicity across operations**.
`ContainsKey` followed by `TryAdd` is a race no matter how you squint.
`GetOrAdd` may run your factory more than once. `Count` takes every lock and is
O(number of locks). `ToArray` is a snapshot; enumeration is not — it is a
moving window that may or may not include concurrent writes.

The practical guidance that survives: use `ConcurrentDictionary` for a cache
whose values are cheap and idempotent to create, wrap expensive creation in
`Lazy<T>`, never build a compound invariant across two operations, and if you
find yourself needing one, you wanted a lock and a plain `Dictionary`.

## The immutable family

`ImmutableArray<T>` is a `struct` wrapping a `T[]`. Indexing is a bounds check
and a load; `Add` copies the whole array. It is the right choice for
configuration, lookup tables, and anything read far more than written.
Its default value is a struct with a null array, so an uninitialised
`ImmutableArray<T>` field throws on use — the one sharp edge.

`ImmutableList<T>` is an AVL tree. Indexing walks the tree, `Add` allocates
`log n` nodes on the path and shares the rest. It is the right choice when you
need many versions alive at once — an undo stack, a snapshot per request — and
the wrong choice for everything else, which is what most misuse looks like.

`FrozenDictionary` and `FrozenSet` (.NET 8) analyse the key set at creation and
select a specialised implementation — for example, comparing string lengths
first, or a single character at a discriminating position — and can be
several times faster to read than `Dictionary`. Creation is correspondingly
expensive. Break-even is typically in the thousands of lookups, which is
trivially met by a startup lookup table and never met by a per-request one.

## When not to think about any of this

The default should be `List<T>` and `Dictionary<TKey, TValue>`, with a capacity
when you know the count. They are excellent, they are what every reader
expects, and swapping to something exotic costs comprehension. The moment to
reach for the analysis in this sector is when a collection is on a hot path
with a measured cost, when n is large enough that growth rate matters, or when
memory per entry has become a constraint. Choosing `FrozenDictionary` for a
five-element lookup because it is "faster" is the same error as choosing
`LinkedList` for insertion: a real property, applied where it cannot pay.
