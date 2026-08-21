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
        throw new NotImplementedException("review1: FirstAbove is not implemented yet - edit this file.");
    }

    /// <summary>
    /// How many items fall inside the inclusive range low..high.
    /// </summary>
    public static int CountBetween<T>(IEnumerable<T> items, T low, T high)
        where T : IComparable<T>
    {
        throw new NotImplementedException("review1: CountBetween is not implemented yet - edit this file.");
    }
}
