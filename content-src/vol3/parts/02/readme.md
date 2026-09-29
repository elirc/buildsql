# V3·C2 — Collections: choosing between them with numbers

## The question this sector answers

"Which collection should I use?" is asked constantly and answered badly,
because the usual answer is a complexity table and the usual reality is a
constant factor. This sector gives you a way to answer it with arithmetic you
can do in a code review: how many elements move, how many nodes allocate, how
many comparisons happen, how many cache lines get touched, and what the build
cost is versus the read cost.

## The structures, and what they really are

| Structure | Underneath | Strong at | Weak at |
| --- | --- | --- | --- |
| `T[]` | contiguous memory | indexing, iteration | any resize |
| `List<T>` | array + count, doubles | append, index, iterate | insert/remove at front |
| `LinkedList<T>` | node per element | splice when you hold the node | anything requiring a walk |
| `Dictionary<K,V>` | bucket array + entry array | keyed lookup | ordering, memory per entry |
| `SortedList<K,V>` | two parallel arrays | build then read in order | insert into the middle |
| `SortedDictionary<K,V>` | red-black tree | ordered data with churn | locality, memory |
| `HashSet<T>` | dictionary without values | membership, set algebra | ordering |
| `Queue<T>` / `Stack<T>` | ring buffer / array | ends only | anything else |
| `ImmutableArray<T>` | array in a struct | read-mostly sharing | any mutation |
| `ImmutableList<T>` | balanced tree | persistent versions | indexing, allocation |
| `FrozenDictionary<K,V>` | analysed at build | read-only lookup tables | rebuilding often |
| `ConcurrentDictionary<K,V>` | striped locks + volatile reads | concurrent keyed access | atomic multi-key work |

## Worked example: the LinkedList argument, with numbers

```csharp
var list = new List<int>(Enumerable.Range(0, 1000));
list.Insert(500, 42);           // O(n): one Array.Copy of 500 ints = 2 KB
```

Two kilobytes of contiguous memory move at roughly 10 GB/s, so about 200
nanoseconds, most of it already in cache because you just walked there.

```csharp
var node = linked.First;
for (int i = 0; i < 500; i++) node = node!.Next;   // 500 cache misses
linked.AddAfter(node, 42);                          // then O(1)
```

Each `Next` is a dependent load — the address of the next node is not known
until the current one arrives — so the CPU cannot prefetch. Five hundred
dependent misses at ~80 nanoseconds each is 40 microseconds: two hundred times
slower, for the structure with the better complexity. The list only loses when
you already have the node and no walk is needed.

## Worked example: what a capacity saves

```csharp
var d = new Dictionary<int, int>();                 // capacity 0
for (int i = 0; i < 1000; i++) d[i] = i;
// resizes at 3, 7, 17, 37, 71, 163, 353, 761, 1597
// entry copies: 3 + 7 + 17 + 37 + 71 + 163 + 353 + 761 = 1412

var d2 = new Dictionary<int, int>(1000);            // one allocation, zero rehashes
```

The same arithmetic applies to `List<T>` with doubling, and to
`StringBuilder`. If you know the count, say the count. It is the highest
value-per-character change available in .NET.

## Worked example: a hash that ruins a dictionary

```csharp
public override int GetHashCode() => Row ^ Column;            // (1,2) == (2,1)
public override int GetHashCode() => HashCode.Combine(Row, Column);  // mixed
```

On a grid of coordinates the XOR version produces a triangular collision
pattern: every symmetric pair shares a bucket, chains grow, and lookups drift
from O(1) toward O(n). The symptom in production is a dictionary that is fine
in tests and quadratic in the field, because the test data was not symmetric.

## Worked example: the GetOrAdd trap

```csharp
// Wrong: the factory can run on several threads at once, and the losers'
// connections are dropped on the floor, unclosed.
var conn = cache.GetOrAdd(key, k => OpenConnection(k));

// Right: creating a Lazy is trivial and idempotent; opening happens once.
var lazy = cache.GetOrAdd(key, k => new Lazy<Connection>(
    () => OpenConnection(k), LazyThreadSafetyMode.ExecutionAndPublication));
var conn = lazy.Value;
```

`ConcurrentDictionary` does not hold a lock across your factory, on purpose.
The documentation says so in one sentence that almost nobody reads.

## Common mistakes

- Quoting amortised complexity as if it were worst case, then being surprised
  by the latency spike at a resize.
- `Dictionary` where an array indexed by a dense integer key would do.
- `ImmutableList<T>` for a read-mostly collection. You wanted
  `ImmutableArray<T>`; the list is a tree and indexing it is O(log n).
- `SortedDictionary` for build-then-read data. `SortedList` is two arrays and
  wins on locality and memory.
- Relying on `Dictionary` enumeration order. It looks insertion-ordered until a
  removal creates a free slot that the next insert reuses.
- `ContainsKey` followed by the indexer: two lookups where `TryGetValue` does
  one.
- `list.Any()` in a hot loop where `list.Count > 0` is free — `Any()` allocates
  an enumerator through the interface.
- Culture-sensitive string keys. `StringComparer.Ordinal` is faster and is
  almost always what you meant; the default comparer for `Dictionary<string,
  T>` is ordinal, but `Sort`, `Contains` on `List<string>` and
  `string.StartsWith` are not.

## Interview answer

*"How would you choose between a `List` and a `Dictionary`?"* — Say what the
access pattern is, then the numbers. If lookups are by key and n is more than
a few dozen, a dictionary; below that, a linear scan of a list is often faster
because it is contiguous and has no hashing. If the data is read far more than
written and needs ordering, a sorted array with binary search beats both on
memory and locality. Then name the deciding constraint: dictionary entries
carry per-entry overhead and lose ordering, so at very large n the memory
difference may decide it for you.

*"When would you use a `LinkedList<T>`?"* — When you already hold the node, so
no traversal is required — an LRU cache's recency list, or an intrusive queue
where each item knows its own node. Otherwise essentially never: the O(1)
splice is real, and finding the place to splice is O(n) with a cache miss per
step.

## Check yourself

1. `List<T>.Insert(0, x)` is O(n). Why is it still faster than a
   `LinkedList<T>` insert at 1,000 elements?
2. What two arrays make up a `Dictionary<K,V>`, and what does each entry hold?
3. Why does the dictionary compare stored hash codes before calling `Equals`?
4. n inserts into a default-constructed `Dictionary` cost roughly how many
   entry copies?
5. Why is XOR a bad way to combine fields into a hash code?
6. What is the difference between `SortedList` and `SortedDictionary`, and
   which one for build-once-read-often?
7. Why is `ImmutableArray<T>` O(1) to index and `ImmutableList<T>` O(log n)?
8. Under what circumstance does `ConcurrentDictionary.GetOrAdd` call your
   factory twice, and what is the fix?
9. Growing a buffer by a constant amount instead of doubling changes the total
   copy cost from what to what?
10. When is `FrozenDictionary` the wrong choice?
11. How many cache lines does iterating a `List<int>` of 1,000 elements touch,
    approximately, and how many does a `LinkedList<int>` touch?
12. Why should you not rely on `Dictionary` enumeration order even though it
    usually looks insertion-ordered?
13. You need membership tests over 20 short strings, called in a hot loop.
    `HashSet<string>` or `string[]` with a linear scan — and how would you
    decide?
14. What does `EnsureCapacity` do that the constructor's capacity argument
    does not?
