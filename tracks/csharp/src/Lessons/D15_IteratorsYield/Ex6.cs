// d15_iterators_yield / ex6 - weaving two sequences with manual enumerators.
// See lessons/d15_iterators_yield/README.md, "Exercise 6".

namespace CSharpDojo.D15_IteratorsYield;

public static class Weaving
{
    /// <summary>
    /// Alternates items from the two sequences - first[0], second[0],
    /// first[1], second[1], ... - and when one runs out, yields the rest of
    /// the other. Needs GetEnumerator/MoveNext by hand: two foreach loops
    /// cannot interleave.
    /// </summary>
    public static IEnumerable<string> Weave(IEnumerable<string> first, IEnumerable<string> second)
    {
        throw new NotImplementedException("ex6: Weave is not implemented yet - edit this file.");
    }
}
