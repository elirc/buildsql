// d12_generics / ex7 - a memo.
// See lessons/d12_generics/README.md, "Exercise 7".

namespace CSharpDojo.D12_Generics;

public class Memo<TKey, TValue>
    where TKey : notnull
{
    private readonly Dictionary<TKey, TValue> _values = new Dictionary<TKey, TValue>();

    /// <summary>How many keys have an answer stored.</summary>
    public int Count => throw new NotImplementedException("ex7: Count is not implemented yet - edit this file.");

    /// <summary>How many times the factory has actually been invoked.</summary>
    public int FactoryCalls { get; private set; }

    /// <summary>
    /// The stored answer for the key, computing and storing it first if there
    /// is none. A factory that throws must leave the memo unchanged, so the
    /// next call tries again.
    /// </summary>
    public TValue GetOrAdd(TKey key, Func<TKey, TValue> factory)
    {
        throw new NotImplementedException("ex7: GetOrAdd is not implemented yet - edit this file.");
    }
}
