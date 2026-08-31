// d12_generics / ex1 - generic methods that need no constraint at all.
// See lessons/d12_generics/README.md, "Exercise 1".

namespace CSharpDojo.D12_Generics;

public static class Sequences
{
    /// <summary>
    /// A list holding <paramref name="count"/> copies of the item. A count of
    /// 0 or less gives an empty list.
    /// </summary>
    public static List<T> Repeat<T>(T item, int count)
    {
        List<T> items = new List<T>();
        for (int i = 0; i < count; i++)
        {
            items.Add(item);
        }

        return items;
    }

    /// <summary>
    /// Take one from each sequence in turn - first[0], second[0], first[1],
    /// second[1], ... - and then whatever is left of the longer one.
    /// </summary>
    public static List<T> Interleave<T>(IEnumerable<T> first, IEnumerable<T> second)
    {
        List<T> items = new List<T>();
        using IEnumerator<T> left = first.GetEnumerator();
        using IEnumerator<T> right = second.GetEnumerator();

        bool hasLeft = left.MoveNext();
        bool hasRight = right.MoveNext();
        while (hasLeft || hasRight)
        {
            if (hasLeft)
            {
                items.Add(left.Current);
                hasLeft = left.MoveNext();
            }

            if (hasRight)
            {
                items.Add(right.Current);
                hasRight = right.MoveNext();
            }
        }

        return items;
    }
}
