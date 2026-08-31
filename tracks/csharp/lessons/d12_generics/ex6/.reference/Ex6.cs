// d12_generics / ex6 - several type parameters, all inferred.
// See lessons/d12_generics/README.md, "Exercise 6".

namespace CSharpDojo.D12_Generics;

public static class Maps
{
    /// <summary>Every item put through the selector, in order.</summary>
    public static List<TResult> Map<TSource, TResult>(
        IEnumerable<TSource> items, Func<TSource, TResult> selector)
    {
        List<TResult> results = new List<TResult>();
        foreach (TSource item in items)
        {
            results.Add(selector(item));
        }

        return results;
    }

    /// <summary>
    /// A dictionary built from the two projections. A key produced more than
    /// once keeps the LATER value rather than throwing.
    /// </summary>
    public static Dictionary<TKey, TValue> ToDictionary<TSource, TKey, TValue>(
        IEnumerable<TSource> items, Func<TSource, TKey> key, Func<TSource, TValue> value)
        where TKey : notnull
    {
        Dictionary<TKey, TValue> result = new Dictionary<TKey, TValue>();
        foreach (TSource item in items)
        {
            result[key(item)] = value(item);
        }

        return result;
    }
}
