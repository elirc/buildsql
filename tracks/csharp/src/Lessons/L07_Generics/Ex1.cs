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
        throw new NotImplementedException("ex1: FirstOr is not implemented yet - edit this file.");
    }

    /// <summary>Exchange the caller's two variables.</summary>
    public static void Swap<T>(ref T a, ref T b)
    {
        throw new NotImplementedException("ex1: Swap is not implemented yet - edit this file.");
    }

    /// <summary>How many items are in the sequence. Count them; do not cast to a list.</summary>
    public static int CountOf<T>(IEnumerable<T> items)
    {
        throw new NotImplementedException("ex1: CountOf is not implemented yet - edit this file.");
    }
}
