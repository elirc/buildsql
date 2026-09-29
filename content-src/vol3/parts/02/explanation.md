# Reading - csharp/v3cc02_collections_by_numbers

## Notes

**Complexity is the growth rate; the constant is the experience.** For n in the
hundreds or low thousands — where most application collections live — a
contiguous O(n) operation routinely beats a pointer-chasing O(1) one. The
question to ask is not "which is asymptotically better" but "at my n, which
does fewer expensive things", where the expensive thing is usually a cache
miss, not an instruction.

**A cache line is 64 bytes.** That is eight `long`s, sixteen `int`s, or four
object references. A `List<int>` walk pulls sixteen elements per miss; a
`LinkedList<int>` walk pulls one node per miss and the node is 40 bytes of
which 4 are your data. This single fact explains most of the surprising
benchmark results in this area, including why `List<T>.Contains` beats
`HashSet<T>.Contains` for small n.

**Dictionary layout, precisely.** Two arrays: `int[] buckets` holding a 1-based
index into `Entry[] entries`, and the entries themselves holding
`{ int hashCode, int next, TKey key, TValue value }`. A lookup computes the
hash, indexes the bucket, then follows `next` comparing *stored hash codes*
first — an int comparison — and only calling `Equals` when the hashes match.
That is why a cheap `GetHashCode` matters more than a cheap `Equals`.

**Growth is doubling for `List`, next-prime for `Dictionary`.** `List<T>`
starts at 4 and doubles; `Dictionary` walks a table of primes (3, 7, 17, 37,
71, 163, 353, ...). Both give amortised O(1) append, and both make n insertions
copy roughly 2n elements in total if you do not pass a capacity. `EnsureCapacity`
exists on both and is the cheapest performance fix in .NET.

**`SortedList` and `SortedDictionary` are not variants of each other.**
`SortedList` is two parallel arrays: O(log n) lookup, O(n) insert, compact and
cache friendly, great for build-then-read. `SortedDictionary` is a red-black
tree: O(log n) insert and lookup, a node per element, better for churn. Picking
the wrong one is a factor-of-ten mistake in either direction depending on the
workload.

**Immutability has a price list.** `ImmutableList<T>` is a balanced tree —
O(log n) indexing, a node per element, and every "mutation" allocates the path.
`ImmutableArray<T>` is a plain array behind a struct wrapper — O(1) indexing,
and every mutation copies the whole thing. They are opposite trade-offs sharing
a name prefix, and the common error is choosing `ImmutableList` for a
read-mostly collection that should have been `ImmutableArray`.

**`FrozenDictionary` (`.NET 8`) is a build-once specialisation.** Creating one
is markedly more expensive than creating a `Dictionary`; reads are faster,
sometimes substantially so for string keys, because it analyses the key set at
build time and picks a strategy. It is for lookup tables built at startup and
read for the life of the process, and for nothing else.

## ex1

Really testing: whether your table has the exceptions in it. Anyone can recite
"dictionary lookup is O(1)". The differentiating answers are the awkward ones:
`List.Insert(0, x)` is O(n) because everything shifts; `List.Remove(x)` is O(n)
because it searches first; `Dictionary` enumeration order is undefined and must
not be relied on even though it looks insertion-ordered; `SortedList.Add` is
O(n) despite the O(log n) search, because the arrays shift. The classic mistake
is quoting the amortised figure without the word "amortised" and then being
surprised by a latency spike at a resize.

## ex2

Really testing: that O(1) is not a synonym for fast. The list's insert moves
`count - index` elements with one `Array.Copy`, which for 1,000 four-byte
elements is a single sub-microsecond memory move; the linked list allocates a
40-byte node, writes three references, and puts your next traversal on a cold
line. The classic mistake is reaching for `LinkedList<T>` after reading a
complexity table. The honest rule: `LinkedList<T>` earns its place only when
you already hold the node — so no traversal is needed to find it — which is
precisely the LRU cache in the review.

## ex3

Really testing: that a hash table is not always the answer. Binary search over
a sorted array costs `log2(n)` comparisons — 10 for a thousand elements, 20 for
a million — with perfect locality and zero per-element overhead, and it gives
you ordering, range queries and predictable memory for free. A dictionary costs
one hash plus one or two probes but adds ~24 bytes of overhead per entry and
loses ordering entirely. The classic mistake is a `Dictionary<int, T>` built
once from a dense key range where an array indexed by key would have been both
faster and simpler.

## ex4

Really testing: that `GetHashCode` is not a formality. XOR-ing fields makes
`(1, 2)` and `(2, 1)` collide, and any symmetric key set — coordinates, pairs,
from/to routes — degenerates to a linear scan. `HashCode.Combine` mixes with a
non-commutative function so order matters and bit patterns spread. The classic
mistake is a hash that is expensive rather than one that is bad: hashing a
whole string when a prefix would do is a cost on every single lookup, which is
usually worse than the occasional collision it prevents.

## ex5

Really testing: what capacity actually saves. n inserts without a capacity
means a sequence of resizes, each allocating a bigger pair of arrays and
rehashing every existing entry; the total entry copies are roughly 2n and the
total allocation is roughly twice the final size. Passing the capacity makes
all of it disappear. The classic mistake is passing the *byte* size or the
expected *maximum* rather than the expected count; the second is calling
`EnsureCapacity` inside the loop, which reintroduces the checks it was meant to
remove.

## ex6

Really testing: what "amortised" means, as arithmetic. Doubling means the
copies for n pushes are `1 + 2 + 4 + ... + n/2 < n`, so fewer than one copy per
element on average, even though one unlucky push copies everything. The classic
mistake is growing by a constant — `capacity + 16` — which turns the total into
O(n²) copies and is a real bug people ship. The other point of the exercise is
the ring itself: `(head + 1) % capacity` is correct and a modulo; masking with
`capacity - 1` is correct only when the capacity is a power of two, which is why
`Queue<T>` grows the way it does.

## ex7

Really testing: that build cost is part of the choice. A structure that is 30%
faster to read but ten times more expensive to build is a win at a million
reads and a loss at ten. Computing the break-even point turns "frozen is
faster" into "frozen is faster above about 4,000 reads per build", which is a
sentence you can act on. The classic mistake is freezing a dictionary that is
rebuilt per request, where you pay the build cost every time and never reach
the break-even.

## ex8

Really testing: the `GetOrAdd` contract nobody reads. `ConcurrentDictionary`
does not hold a lock while your factory runs — deliberately, so a slow factory
cannot block the whole dictionary — so two threads can both miss, both run the
factory, and one result is silently discarded. If the factory opens a
connection, starts a timer or registers a handler, the discarded one leaks. The
fix is to store `Lazy<T>` values: the factory that creates the `Lazy` is
trivial and idempotent, and `Lazy<T>` with `ExecutionAndPublication` guarantees
the expensive work happens exactly once. The classic mistake is "assuming" the
dictionary locks, which is a bug you will never reproduce on your laptop.

## Further reading

- [List&lt;T&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1) - capacity, growth, Insert and Remove costs.
- [Dictionary&lt;TKey, TValue&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2) - buckets, entries, capacity.
- [HashCode.Combine](https://learn.microsoft.com/en-us/dotnet/api/system.hashcode.combine) - the mixing function you should be using.
- [FrozenDictionary&lt;TKey, TValue&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.frozen.frozendictionary-2) - build once, read forever.
- [ConcurrentDictionary.GetOrAdd](https://learn.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentdictionary-2.getoradd) - the factory-may-run-twice remark.
- [Choosing a collection](https://learn.microsoft.com/en-us/dotnet/standard/collections/) - the BCL's own decision guidance.
