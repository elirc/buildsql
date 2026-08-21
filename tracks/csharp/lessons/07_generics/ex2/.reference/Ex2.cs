// 07_generics / ex2 - constraints: what you may assume about T.
// See lessons/07_generics/README.md, "Exercise 2".

namespace CSharpDojo.L07_Generics;

public static class Constrained
{
    /// <summary>
    /// The largest item. The constraint is what lets you compare two Ts at all.
    /// An empty sequence has no largest item: throw InvalidOperationException.
    /// </summary>
    public static T Max<T>(IEnumerable<T> items) where T : IComparable<T>
    {
        bool seenAny = false;
        T best = default!;
        foreach (T item in items)
        {
            if (!seenAny || item.CompareTo(best) > 0)
            {
                best = item;
                seenAny = true;
            }
        }

        if (!seenAny)
        {
            throw new InvalidOperationException("Max of an empty sequence is undefined.");
        }

        return best;
    }

    /// <summary>
    /// A list of <paramref name="count"/> freshly constructed Ts. The new()
    /// constraint is what lets you write new T().
    /// </summary>
    public static List<T> Fill<T>(int count) where T : new()
    {
        List<T> items = new List<T>();
        for (int i = 0; i < count; i++)
        {
            items.Add(new T());
        }

        return items;
    }
}
