# V3·C2 — Collections: choosing between them with numbers

Every team has an argument about `List` versus `LinkedList`, and it is always
conducted in adjectives. "Insertion is O(1)." "Yes, but it is slow." Both
sides are right, which is how you know the argument is missing a number.

The previous sector gave you one of the numbers: bytes allocated. This one
gives you the rest. By the end you should be able to answer "which collection"
with an estimate — how many element moves, how many rehashes, how many
comparisons, how many cache lines — and be able to say what would change your
mind. That is a different skill from memorising a complexity table, and it is
the one that survives contact with a profiler.

## The table is true and insufficient

Asymptotic complexity tells you how a cost grows. It says nothing about the
constant, and for the sizes most code actually handles, the constant is the
whole story. `LinkedList<T>.AddAfter` really is O(1) and really is slower than
`List<T>.Insert` at n = 1,000, because the list's "expensive" operation is a
single `Array.Copy` of contiguous memory — which modern hardware does at tens of
gigabytes a second — while the linked list's "cheap" operation allocates a node
and follows a pointer into cold memory.

The rule to carry: **contiguity beats asymptotics until n is large or the
element is big.** A `List<T>` walk touches one cache line per few elements; a
`LinkedList<T>` walk touches one cache line per element, in whatever order the
allocator happened to place them.

```csharp
// O(n) and fast: one contiguous move of 4,000 bytes.
list.Insert(500, item);

// O(1) and slower: allocate a node, write three pointers, touch cold memory.
linked.AddAfter(node, item);
```

## Where a dictionary actually spends its time

`Dictionary<TKey, TValue>` is an array of buckets plus an array of entries.
A lookup hashes the key, maps the hash to a bucket, then walks a chain of
entries comparing hashes first and keys second. So a lookup costs: one hash
computation, one or two cache misses, and however many comparisons the chain
requires.

Three consequences you can act on:

- **Your `GetHashCode` is the performance.** A hash that collides turns the
  chain walk into a linear scan. XOR-ing two fields is the classic way to
  produce a hash where `(1, 2)` and `(2, 1)` collide.
- **Growth is not free.** The dictionary resizes when it fills, choosing the
  next prime capacity and rehashing every entry. n inserts into a default
  dictionary cost roughly 2n entry copies across the resizes. Passing a
  capacity avoids all of them.
- **String keys are compared, not just hashed.** `StringComparer.Ordinal` is
  measurably faster than the culture-aware default, and it is what you almost
  always meant.

## Exercise 1 - the cost table you can defend

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex1.cs`. Implement
`CostModel.ComplexityOf(string collection, string operation)` returning
strings like `"O(1)"`, `"O(1) amortised"`, `"O(log n)"` and `"O(n)"` for the
combinations the gate asks about, and `CostModel.Explain(...)` giving the
one-sentence reason. `"unsupported"` for combinations that do not exist.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex1
```

## Exercise 2 - the argument, settled with a counter

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex2.cs`. `InsertionCost.ForList`
and `InsertionCost.ForLinkedList` perform the same middle insertions and
report `(int ElementMoves, int NodeAllocations)`. The list moves elements and
allocates nothing; the linked list moves nothing and allocates a node per
insert. Then `InsertionCost.Recommend(...)` picks a winner using a stated rule
about which cost dominates.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex2
```

## Exercise 3 - hash lookup versus binary search

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex3.cs`. Implement
`SortedIndex.BinarySearch` over a sorted array (returning the index or the
bitwise complement of the insertion point, like the BCL) and count the
comparisons, then `Lookup.Choose(int n, int reads, int writes)` which prefers
the sorted array for read-heavy, ordered, or small workloads and the
dictionary otherwise.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex3
```

## Exercise 4 - a bad hash, quantified

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex4.cs`. Two comparers for a
`(Row, Column)` key: one XORs, one combines properly with `HashCode.Combine`.
`HashQuality.CountCollisions` distributes the keys into buckets and reports
`(int OccupiedBuckets, int LongestChain, double AverageProbe)`. The XOR
comparer must visibly lose on a symmetric key set.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex4
```

## Exercise 5 - what a capacity argument buys

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex5.cs`. `GrowthPlan.ForCount`
returns the sequence of capacities a `Dictionary` passes through for n inserts
(3, 7, 17, 37, 71, ... the primes the BCL uses) and `GrowthPlan.EntryCopies`
sums the rehashing cost. `GrowthPlan.SavedBy(int count)` reports what
`new Dictionary(count)` avoids.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex5
```

## Exercise 6 - amortised, proved

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex6.cs`. Implement `RingDeque<T>`
— push and pop at both ends, wrapping indices, doubling when full — and expose
`Copies`, the total number of elements ever moved by a growth. Pushing n items
must cost fewer than 2n copies, which is the amortised O(1) claim as an
assertion rather than a slogan.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex6
```

## Exercise 7 - build once, read a million times

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex7.cs`. `FrozenLookup<TKey,
TValue>` builds a perfect-ish lookup once (sorted keys plus binary search) and
answers reads without touching a bucket chain. Then
`FrozenLookup.BreakEvenQueries` computes how many reads it takes to repay a
build cost, given per-operation costs.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex7
```

## Exercise 8 - the factory that runs twice

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex8.cs`.
`ConcurrentDictionary.GetOrAdd` may invoke your factory more than once for the
same key under contention, and the loser's value is discarded — which is a
disaster if that value is a connection. Implement `CachedFactory.GetOrAdd` the
naive way and `CachedFactory.GetOrAddLazy` with `Lazy<T>`, and count factory
invocations under concurrent pressure.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex8
```

## Challenge

`WorkloadPlanner` takes a workload — element count, read/write mix, whether
order matters, whether keys are ranges — estimates the cost of three candidate
structures in comparable units, and returns both the recommendation and the
runner-up with the margin. Then you implement the structure it picks. A
recommendation you cannot compute is a preference.

## Review

`review1` is the LRU cache: a `Dictionary` for O(1) lookup and a doubly linked
list for O(1) recency, which is the one design where the linked list genuinely
earns its place — because you always hold the node, so you never walk. Get the
eviction order right and you have used every idea in this sector at once.
