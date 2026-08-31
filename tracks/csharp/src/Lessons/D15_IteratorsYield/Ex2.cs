// d15_iterators_yield / ex2 - transforming lazily.
// See lessons/d15_iterators_yield/README.md, "Exercise 2".

namespace CSharpDojo.D15_IteratorsYield;

public static class Transforms
{
    /// <summary>Yields each item twice, in order: a, a, b, b, ...</summary>
    public static IEnumerable<T> Stutter<T>(IEnumerable<T> items)
    {
        throw new NotImplementedException("ex2: Stutter is not implemented yet - edit this file.");
    }

    /// <summary>Yields "1. a", "2. b", ... - each item behind a 1-based number.</summary>
    public static IEnumerable<string> Numbered(IEnumerable<string> items)
    {
        throw new NotImplementedException("ex2: Numbered is not implemented yet - edit this file.");
    }
}
