// d15_iterators_yield / ex5 - an iterator postpones EVERYTHING, including your argument checks.
// See lessons/d15_iterators_yield/README.md, "Exercise 5".

namespace CSharpDojo.D15_IteratorsYield;

public static class Sampling
{
    /// <summary>
    /// Yields the items at positions 0, n, 2n, ... (so n = 1 keeps everything).
    /// n below 1 throws ArgumentOutOfRangeException - and it must throw AT THE
    /// CALL, not later when somebody finally enumerates. A method containing
    /// yield cannot do that; split it in two.
    /// </summary>
    public static IEnumerable<T> EveryNth<T>(IEnumerable<T> items, int n)
    {
        if (n < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(n), n, "n must be at least 1");
        }

        return Iterator(items, n);
    }

    private static IEnumerable<T> Iterator<T>(IEnumerable<T> items, int n)
    {
        int position = 0;
        foreach (T item in items)
        {
            if (position % n == 0)
            {
                yield return item;
            }

            position++;
        }
    }
}
