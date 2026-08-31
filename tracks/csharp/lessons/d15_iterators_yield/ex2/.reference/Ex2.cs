// d15_iterators_yield / ex2 - transforming lazily.
// See lessons/d15_iterators_yield/README.md, "Exercise 2".

namespace CSharpDojo.D15_IteratorsYield;

public static class Transforms
{
    /// <summary>Yields each item twice, in order: a, a, b, b, ...</summary>
    public static IEnumerable<T> Stutter<T>(IEnumerable<T> items)
    {
        foreach (T item in items)
        {
            yield return item;
            yield return item;
        }
    }

    /// <summary>Yields "1. a", "2. b", ... - each item behind a 1-based number.</summary>
    public static IEnumerable<string> Numbered(IEnumerable<string> items)
    {
        int number = 1;
        foreach (string item in items)
        {
            yield return $"{number}. {item}";
            number++;
        }
    }
}
