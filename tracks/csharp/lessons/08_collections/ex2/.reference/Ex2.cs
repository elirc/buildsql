// 08_collections / ex2 - HashSet: membership, uniqueness, set maths.
// See lessons/08_collections/README.md, "Exercise 2".

namespace CSharpDojo.L08_Collections;

public static class Sets
{
    /// <summary>
    /// Each item once, in the order it was FIRST seen. Comparison is
    /// case-sensitive: "Cat" and "cat" are two different items.
    /// </summary>
    public static List<string> DistinctInOrder(IEnumerable<string> items)
    {
        HashSet<string> seen = new HashSet<string>();
        List<string> result = new List<string>();
        foreach (string item in items)
        {
            if (seen.Add(item))
            {
                result.Add(item);
            }
        }

        return result;
    }

    /// <summary>
    /// How many DISTINCT items appear in both sequences. Duplicates on either
    /// side count once.
    /// </summary>
    public static int SharedCount(IEnumerable<string> left, IEnumerable<string> right)
    {
        HashSet<string> shared = new HashSet<string>(left);
        shared.IntersectWith(right);
        return shared.Count;
    }
}
