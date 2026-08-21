// i2_interview_drills / ex2 - an LRU cache. Time-box: 25 minutes.
// See lessons/i2_interview_drills/README.md, "Exercise 2".

namespace CSharpDojo.I2_InterviewDrills;

/// <summary>
/// Keeps at most Capacity entries. When it is full, adding a new key evicts the
/// LEAST recently used one. Reading a key counts as using it.
/// </summary>
public class LruCache<TKey, TValue> where TKey : notnull
{
    private readonly Dictionary<TKey, LinkedListNode<(TKey Key, TValue Value)>> _entries = new();
    private readonly LinkedList<(TKey Key, TValue Value)> _order = new();

    public LruCache(int capacity)
    {
        if (capacity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(capacity), capacity, "A cache holds at least one entry.");
        }

        Capacity = capacity;
    }

    public int Capacity { get; }

    public int Count => _entries.Count;

    /// <summary>The keys, most recently used first. The gate reads this to check the order.</summary>
    public IReadOnlyList<TKey> KeysNewestFirst => _order.Select(entry => entry.Key).ToList();

    /// <summary>Look a key up, and count that as using it.</summary>
    public bool TryGet(TKey key, out TValue value)
    {
        if (!_entries.TryGetValue(key, out LinkedListNode<(TKey Key, TValue Value)>? node))
        {
            value = default!;
            return false;
        }

        _order.Remove(node);
        _order.AddFirst(node);
        value = node.Value.Value;
        return true;
    }

    /// <summary>
    /// Add or update. An existing key keeps its place in the cache but becomes
    /// the most recently used; a new key evicts the least recently used one
    /// when the cache is full.
    /// </summary>
    public void Put(TKey key, TValue value)
    {
        if (_entries.TryGetValue(key, out LinkedListNode<(TKey Key, TValue Value)>? existing))
        {
            _order.Remove(existing);
            existing.Value = (key, value);
            _order.AddFirst(existing);
            return;
        }

        if (_entries.Count == Capacity)
        {
            LinkedListNode<(TKey Key, TValue Value)>? oldest = _order.Last;
            if (oldest is not null)
            {
                _order.RemoveLast();
                _entries.Remove(oldest.Value.Key);
            }
        }

        _entries[key] = _order.AddFirst((key, value));
    }
}
