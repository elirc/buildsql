// d15_iterators_yield / ex3 - infinite sequences are fine, as long as nobody asks for all of them.
// See lessons/d15_iterators_yield/README.md, "Exercise 3".

namespace CSharpDojo.D15_IteratorsYield;

public static class Endless
{
    /// <summary>
    /// Yields the items over and over, forever: a, b, c, a, b, c, ...
    /// An empty list yields nothing (rather than looping forever on nothing).
    /// </summary>
    public static IEnumerable<T> Cycle<T>(IReadOnlyList<T> items)
    {
        throw new NotImplementedException("ex3: Cycle is not implemented yet - edit this file.");
    }

    /// <summary>Yields start, start+1, start+2, ... without end.</summary>
    public static IEnumerable<int> From(int start)
    {
        throw new NotImplementedException("ex3: From is not implemented yet - edit this file.");
    }
}
