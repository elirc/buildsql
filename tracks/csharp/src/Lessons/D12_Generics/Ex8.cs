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
        throw new NotImplementedException("ex8: Add is not implemented yet - edit this file.");
    }

    /// <summary>How many of that key have been added. 0 for a key never seen.</summary>
    public int CountOf(TKey key)
    {
        throw new NotImplementedException("ex8: CountOf is not implemented yet - edit this file.");
    }

    /// <summary>How many different keys have been added.</summary>
    public int Distinct =>
        throw new NotImplementedException("ex8: Distinct is not implemented yet - edit this file.");

    /// <summary>
    /// The most frequent keys first, at most <paramref name="count"/> of them.
    /// Keys with the SAME count come back in the order they were first added.
    /// A count of 0 or less gives an empty list.
    /// </summary>
    public IReadOnlyList<TKey> TopKeys(int count)
    {
        throw new NotImplementedException("ex8: TopKeys is not implemented yet - edit this file.");
    }
}
