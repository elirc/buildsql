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

    public int Count =>
        throw new NotImplementedException("ex2: Count is not implemented yet - edit this file.");

    /// <summary>The keys, most recently used first. The gate reads this to check the order.</summary>
    public IReadOnlyList<TKey> KeysNewestFirst =>
        throw new NotImplementedException("ex2: KeysNewestFirst is not implemented yet - edit this file.");

    /// <summary>Look a key up, and count that as using it.</summary>
    public bool TryGet(TKey key, out TValue value)
    {
        throw new NotImplementedException("ex2: TryGet is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Add or update. An existing key keeps its place in the cache but becomes
    /// the most recently used; a new key evicts the least recently used one
    /// when the cache is full.
    /// </summary>
    public void Put(TKey key, TValue value)
    {
        throw new NotImplementedException("ex2: Put is not implemented yet - edit this file.");
    }
}
