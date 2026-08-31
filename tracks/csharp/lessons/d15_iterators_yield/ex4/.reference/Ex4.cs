// d15_iterators_yield / ex4 - adjacent pairs from a single pass.
// See lessons/d15_iterators_yield/README.md, "Exercise 4".

namespace CSharpDojo.D15_IteratorsYield;

public static class Pairs
{
    /// <summary>
    /// Yields each adjacent pair: for 3, 10, 6 the pairs are (3, 10) and
    /// (10, 6). Fewer than two items yields nothing. The source must be
    /// walked exactly ONCE - remember the previous item, do not restart.
    /// </summary>
    public static IEnumerable<(int Left, int Right)> Pairwise(IEnumerable<int> values)
    {
        bool first = true;
        int previous = 0;

        foreach (int value in values)
        {
            if (!first)
            {
                yield return (previous, value);
            }

            previous = value;
            first = false;
        }
    }

    /// <summary>
    /// Yields each step's change: for 3, 10, 6 the deltas are 7 and -4.
    /// Same single-pass rule.
    /// </summary>
    public static IEnumerable<int> Deltas(IEnumerable<int> values)
    {
        bool first = true;
        int previous = 0;

        foreach (int value in values)
        {
            if (!first)
            {
                yield return value - previous;
            }

            previous = value;
            first = false;
        }
    }
}
