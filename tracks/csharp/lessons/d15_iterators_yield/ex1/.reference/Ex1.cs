// d15_iterators_yield / ex1 - two straightforward iterators.
// See lessons/d15_iterators_yield/README.md, "Exercise 1".

namespace CSharpDojo.D15_IteratorsYield;

public static class Ranges
{
    /// <summary>
    /// Yields first, first+1, ... last (inclusive). When last is below first,
    /// yields nothing at all.
    /// </summary>
    public static IEnumerable<int> UpTo(int first, int last)
    {
        for (int value = first; value <= last; value++)
        {
            yield return value;
        }
    }

    /// <summary>
    /// Yields <paramref name="item"/> exactly <paramref name="times"/> times;
    /// zero (or fewer) times yields nothing.
    /// </summary>
    public static IEnumerable<string> Repeat(string item, int times)
    {
        for (int i = 0; i < times; i++)
        {
            yield return item;
        }
    }
}
