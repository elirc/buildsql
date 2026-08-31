// d20_linq_joins_flatten / ex3 - flattening.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 3".

namespace CSharpDojo.D20_LinqJoinsFlatten;

public static class Flatten
{
    /// <summary>Every number from every inner sequence, in order.</summary>
    public static List<int> All(IEnumerable<IEnumerable<int>> groups)
    {
        return groups.SelectMany(group => group).ToList();
    }

    /// <summary>Every character of every word, in order.</summary>
    public static List<char> Letters(IEnumerable<string> words)
    {
        return words.SelectMany(word => word).ToList();
    }

    /// <summary>
    /// Every left paired with every right, as "a-1". The lefts move slowest,
    /// so the first left is paired with every right before the second left
    /// appears.
    /// </summary>
    public static List<string> Pairs(IEnumerable<string> lefts, IEnumerable<string> rights)
    {
        return lefts
            .SelectMany(left => rights, (left, right) => $"{left}-{right}")
            .ToList();
    }
}
