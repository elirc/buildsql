// 07_generics / review1 - a generic method with a constraint, one more time.
// See lessons/07_generics/README.md, "Review".

namespace CSharpDojo.L07_Generics;

public static class Thresholds
{
    /// <summary>
    /// The first item strictly greater than <paramref name="threshold"/>, or
    /// <paramref name="fallback"/> when there is none.
    /// </summary>
    public static T FirstAbove<T>(IEnumerable<T> items, T threshold, T fallback)
        where T : IComparable<T>
    {
        foreach (T item in items)
        {
            if (item.CompareTo(threshold) > 0)
            {
                return item;
            }
        }

        return fallback;
    }

    /// <summary>
    /// How many items fall inside the inclusive range low..high.
    /// </summary>
    public static int CountBetween<T>(IEnumerable<T> items, T low, T high)
        where T : IComparable<T>
    {
        int count = 0;
        foreach (T item in items)
        {
            if (item.CompareTo(low) >= 0 && item.CompareTo(high) <= 0)
            {
                count++;
            }
        }

        return count;
    }
}
