// d12_generics / ex1 - generic methods that need no constraint at all.
// See lessons/d12_generics/README.md, "Exercise 1".

namespace CSharpDojo.D12_Generics;

public static class Sequences
{
    /// <summary>
    /// A list holding <paramref name="count"/> copies of the item. A count of
    /// 0 or less gives an empty list.
    /// </summary>
    public static List<T> Repeat<T>(T item, int count)
    {
        throw new NotImplementedException("ex1: Repeat is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Take one from each sequence in turn - first[0], second[0], first[1],
    /// second[1], ... - and then whatever is left of the longer one.
    /// </summary>
    public static List<T> Interleave<T>(IEnumerable<T> first, IEnumerable<T> second)
    {
        throw new NotImplementedException("ex1: Interleave is not implemented yet - edit this file.");
    }
}
