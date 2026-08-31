// d12_generics / ex8 - counting, with a tie-break a dictionary cannot give you.
// See lessons/d12_generics/README.md, "Exercise 8".

namespace CSharpDojo.D12_Generics;

public class Histogram<TKey>
    where TKey : notnull
{
    private readonly Dictionary<TKey, int> _counts = new Dictionary<TKey, int>();
    private readonly List<TKey> _order = new List<TKey>();

    /// <summary>Count one more of this key.</summary>
    public void Add(TKey key)
    {
        if (_counts.TryGetValue(key, out int existing))
        {
            _counts[key] = existing + 1;
            return;
        }

        _counts[key] = 1;
        _order.Add(key);
    }

    /// <summary>How many of that key have been added. 0 for a key never seen.</summary>
    public int CountOf(TKey key) => _counts.TryGetValue(key, out int count) ? count : 0;

    /// <summary>How many different keys have been added.</summary>
    public int Distinct => _counts.Count;

    /// <summary>
    /// The most frequent keys first, at most <paramref name="count"/> of them.
    /// Keys with the SAME count come back in the order they were first added.
    /// A count of 0 or less gives an empty list.
    /// </summary>
    public IReadOnlyList<TKey> TopKeys(int count)
    {
        if (count <= 0)
        {
            return new List<TKey>();
        }

        return _order
            .OrderByDescending(key => _counts[key])
            .Take(count)
            .ToList();
    }
}
