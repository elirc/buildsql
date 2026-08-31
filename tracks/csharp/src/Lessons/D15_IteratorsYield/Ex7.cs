// d15_iterators_yield / ex7 - merging two sorted sequences, lazily.
// See lessons/d15_iterators_yield/README.md, "Exercise 7".

namespace CSharpDojo.D15_IteratorsYield;

public static class Merging
{
    /// <summary>
    /// Both inputs are already ascending. Yields all their items in one
    /// ascending sequence, keeping duplicates, reading each input exactly
    /// once, and never buffering - a value is read from a source only when it
    /// might be the next smallest.
    /// </summary>
    public static IEnumerable<int> Merge(IEnumerable<int> left, IEnumerable<int> right)
    {
        throw new NotImplementedException("ex7: Merge is not implemented yet - edit this file.");
    }
}
