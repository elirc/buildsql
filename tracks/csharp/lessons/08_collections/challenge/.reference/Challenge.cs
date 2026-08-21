// 08_collections / challenge - a collection of your own that foreach understands.
// See lessons/08_collections/README.md, "Challenge".

using System.Collections;

namespace CSharpDojo.L08_Collections;

/// <summary>
/// Keeps the most recent <c>Capacity</c> items. Adding to a full buffer drops
/// the oldest. Enumerating walks oldest to newest.
/// </summary>
public class RingBuffer<T> : IEnumerable<T>
{
    private readonly List<T> _items = new List<T>();

    public RingBuffer(int capacity)
    {
        if (capacity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(capacity), capacity, "A ring buffer holds at least one item.");
        }

        Capacity = capacity;
    }

    public int Capacity { get; }

    public int Count => _items.Count;

    /// <summary>Append, dropping the oldest item if that would overflow.</summary>
    public void Add(T item)
    {
        _items.Add(item);
        if (_items.Count > Capacity)
        {
            _items.RemoveAt(0);
        }
    }

    /// <summary>Oldest first. Use an iterator - do not copy into a new list.</summary>
    public IEnumerator<T> GetEnumerator()
    {
        foreach (T item in _items)
        {
            yield return item;
        }
    }

    /// <summary>The old non-generic version, implemented explicitly. Written for you.</summary>
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
