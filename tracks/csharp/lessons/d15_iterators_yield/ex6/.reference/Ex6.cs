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
        using IEnumerator<string> a = first.GetEnumerator();
        using IEnumerator<string> b = second.GetEnumerator();

        bool hasA = a.MoveNext();
        bool hasB = b.MoveNext();

        while (hasA || hasB)
        {
            if (hasA)
            {
                yield return a.Current;
                hasA = a.MoveNext();
            }

            if (hasB)
            {
                yield return b.Current;
                hasB = b.MoveNext();
            }
        }
    }
}
