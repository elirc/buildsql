// d12_generics / ex3 - class, struct, notnull.
// See lessons/d12_generics/README.md, "Exercise 3".

namespace CSharpDojo.D12_Generics;

public static class Defaults
{
    /// <summary>
    /// The value when it is not null, otherwise the fallback.
    /// TRef is a reference type, so TRef? is a nullable annotation.
    /// </summary>
    public static TRef RefOrFallback<TRef>(TRef? value, TRef fallback)
        where TRef : class
    {
        return value ?? fallback;
    }

    /// <summary>
    /// The same idea for value types, where TVal? is Nullable&lt;TVal&gt;.
    /// The two methods need different NAMES: constraints do not take part in
    /// overload resolution.
    /// </summary>
    public static TVal ValueOrFallback<TVal>(TVal? value, TVal fallback)
        where TVal : struct
    {
        return value ?? fallback;
    }

    /// <summary>
    /// How many times each key appears. `notnull` is what lets TKey be a
    /// dictionary key without a warning.
    /// </summary>
    public static Dictionary<TKey, int> CountBy<TKey>(IEnumerable<TKey> keys)
        where TKey : notnull
    {
        Dictionary<TKey, int> counts = new Dictionary<TKey, int>();
        foreach (TKey key in keys)
        {
            counts[key] = counts.TryGetValue(key, out int existing) ? existing + 1 : 1;
        }

        return counts;
    }
}
