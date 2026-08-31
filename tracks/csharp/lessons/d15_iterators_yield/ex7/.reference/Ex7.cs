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
        using IEnumerator<int> a = left.GetEnumerator();
        using IEnumerator<int> b = right.GetEnumerator();

        bool hasA = a.MoveNext();
        bool hasB = b.MoveNext();

        while (hasA && hasB)
        {
            if (a.Current <= b.Current)
            {
                yield return a.Current;
                hasA = a.MoveNext();
            }
            else
            {
                yield return b.Current;
                hasB = b.MoveNext();
            }
        }

        while (hasA)
        {
            yield return a.Current;
            hasA = a.MoveNext();
        }

        while (hasB)
        {
            yield return b.Current;
            hasB = b.MoveNext();
        }
    }
}
