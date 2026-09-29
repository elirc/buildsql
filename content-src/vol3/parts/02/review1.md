@@PROMPT@@
## Review 1 - the one place a linked list earns its keep

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Review1.cs`.

`LruCache<TKey, TValue>` with a fixed capacity, every operation O(1):

- `LruCache(int capacity)` — capacity below 1 throws
  `ArgumentOutOfRangeException`.
- `bool TryGet(TKey key, out TValue? value)` — a hit moves the entry to the
  most-recent end; a miss changes nothing.
- `void Put(TKey key, TValue value)` — inserts or updates, marks the entry
  most-recent, and evicts the least-recently-used entry when the capacity is
  exceeded.
- `int Count`, `int Evictions`, `int Hits`, `int Misses`.
- `IReadOnlyList<TKey> KeysMostRecentFirst()` — for inspection.
- `TKey? LastEvictedKey`.

The internals are the point: a `Dictionary<TKey, LinkedListNode<Entry>>` for
lookup and a `LinkedList<Entry>` for recency. Because the dictionary hands you
the *node*, no traversal is ever needed — which is the one condition under
which a linked list beats an array.

```
var cache = new LruCache<string, int>(capacity: 2);
cache.Put("a", 1);
cache.Put("b", 2);
cache.TryGet("a", out _);        // true - "a" is now the most recent
cache.Put("c", 3);               // evicts "b", the least recently used
cache.KeysMostRecentFirst()      -> ["c", "a"]
cache.LastEvictedKey             -> "b"
cache.Evictions                  -> 1
cache.TryGet("b", out _)         -> false
cache.Hits / cache.Misses        -> 1 / 1

cache.Put("a", 99);              // update, not insert: no eviction
cache.Count                      -> 2
```

Then `LruCache.OperationsFor(int gets, int puts)` returns the number of
*pointer operations* the design performs — `2` per recency move (unlink and
relink) and `1` per dictionary write — so you can state the O(1) claim as a
number rather than a letter.

```
uv run dojo test csharp v3cc02_collections_by_numbers review1
```
@@HINTS@@
## Hint 1

Two structures, one invariant: every key in the dictionary maps to a node
that is currently in the list, and the list's head is the most recently used.
Every operation must restore that invariant before it returns. Write it as a
comment at the top of the class and check each method against it.

## Hint 2

The recency move, which is where the O(1) lives:

```csharp
recency.Remove(node);        // O(1): the node knows its neighbours
recency.AddFirst(node);      // O(1): reuses the same node object
```

`LinkedList<T>.Remove(LinkedListNode<T>)` is the O(1) overload;
`Remove(T value)` is the O(n) one that searches. Passing the node is the whole
trick, and using the wrong overload silently turns your cache linear.

## Hint 3

Eviction happens after the insert, not before: add the new entry, then if
`Count > capacity` take `recency.Last`, remove it from both structures, record
the key and increment the counter. Decide what `Put` does when the key already
exists — the answer is "update the value and move to front, and never evict",
and the gate checks it, because an update that evicts is the classic
off-by-one in this design.
@@IMPORTANT@@
## Hint 1

Ask why the array-based alternative loses here. Keeping recency in a `List<T>`
means every hit removes from the middle and appends — O(n) element moves per
*read*, on the hottest path in the cache. The linked list turns that into two
pointer writes. This is the exception that proves ex2's rule: the walk is what
was expensive, and the dictionary has removed the walk.

## Hint 2

The node carries the key as well as the value, and it has to:

```csharp
private readonly record struct Entry(TKey Key, TValue Value);
```

When you evict from the tail you have a node and need its key to remove the
dictionary entry. Storing only the value leaves you with a node you cannot
un-index, which is the bug everyone writes once.

## Hint 3

`LinkedListNode<T>.Value` is settable, so an update can reuse the node rather
than allocating a new one — worth doing, and worth noticing that it is only
possible because `Entry` is a value type you can overwrite wholesale. Count the
operations in `OperationsFor` honestly: a hit is a move (2) and no dictionary
write, a put of a new key is a dictionary write (1) plus a list insert, and an
eviction is another dictionary write plus an unlink.
@@REF@@
// v3cc02_collections_by_numbers / review1 - the one place a linked list earns its keep.
// See lessons/v3cc02_collections_by_numbers/README.md, "Review 1".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

/// <summary>
/// Invariant: every key in the map refers to a node currently in the recency
/// list, and recency.First is the most recently used entry. Every operation
/// restores that before returning.
/// </summary>
public sealed class LruCache<TKey, TValue>
    where TKey : notnull
{
    private readonly record struct Entry(TKey Key, TValue Value);

    private readonly Dictionary<TKey, LinkedListNode<Entry>> map;
    private readonly LinkedList<Entry> recency = new();
    private readonly int capacity;

    public LruCache(int capacity)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(capacity, 1);

        this.capacity = capacity;
        map = new Dictionary<TKey, LinkedListNode<Entry>>(capacity);
    }

    public int Count => map.Count;

    public int Evictions { get; private set; }

    public int Hits { get; private set; }

    public int Misses { get; private set; }

    public TKey? LastEvictedKey { get; private set; }

    public bool TryGet(TKey key, out TValue? value)
    {
        if (!map.TryGetValue(key, out LinkedListNode<Entry>? node))
        {
            Misses++;
            value = default;
            return false;
        }

        Hits++;
        Touch(node);
        value = node.Value.Value;
        return true;
    }

    public void Put(TKey key, TValue value)
    {
        if (map.TryGetValue(key, out LinkedListNode<Entry>? existing))
        {
            // An update never evicts: the count has not changed.
            existing.Value = new Entry(key, value);
            Touch(existing);
            return;
        }

        LinkedListNode<Entry> node = recency.AddFirst(new Entry(key, value));
        map[key] = node;

        if (map.Count > capacity)
        {
            Evict();
        }
    }

    public IReadOnlyList<TKey> KeysMostRecentFirst()
    {
        List<TKey> keys = new(recency.Count);
        for (LinkedListNode<Entry>? node = recency.First; node is not null; node = node.Next)
        {
            keys.Add(node.Value.Key);
        }

        return keys;
    }

    /// <summary>
    /// The O(1) claim as a count: two pointer operations per recency move,
    /// one per dictionary write.
    /// </summary>
    public static int OperationsFor(int gets, int puts)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(gets);
        ArgumentOutOfRangeException.ThrowIfNegative(puts);

        return (gets * 2) + (puts * 3);
    }

    private void Touch(LinkedListNode<Entry> node)
    {
        if (ReferenceEquals(node, recency.First))
        {
            return;
        }

        // The O(1) overload: the node already knows its neighbours. The
        // Remove(T) overload searches, and would make every read linear.
        recency.Remove(node);
        recency.AddFirst(node);
    }

    private void Evict()
    {
        LinkedListNode<Entry>? oldest = recency.Last;
        if (oldest is null)
        {
            return;
        }

        // The node carries its key precisely so eviction can un-index it.
        LastEvictedKey = oldest.Value.Key;
        recency.RemoveLast();
        map.Remove(oldest.Value.Key);
        Evictions++;
    }
}
