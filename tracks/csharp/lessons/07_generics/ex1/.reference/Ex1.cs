// 07_generics / ex1 - generic methods: one implementation, any element type.
// See lessons/07_generics/README.md, "Exercise 1".

namespace CSharpDojo.L07_Generics;

public static class Utils
{
    /// <summary>
    /// The first item, or <paramref name="fallback"/> when there is none.
    /// No casting, no object, no copy per element type.
    /// </summary>
    public static T FirstOr<T>(IEnumerable<T> items, T fallback)
    {
        foreach (T item in items)
        {
            return item;
        }

        return fallback;
    }

    /// <summary>Exchange the caller's two variables.</summary>
    public static void Swap<T>(ref T a, ref T b)
    {
        T temporary = a;
        a = b;
        b = temporary;
    }

    /// <summary>How many items are in the sequence. Count them; do not cast to a list.</summary>
    public static int CountOf<T>(IEnumerable<T> items)
    {
        int count = 0;
        foreach (T item in items)
        {
            count++;
        }

        return count;
    }
}
