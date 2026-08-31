// d20_linq_joins_flatten / ex3 - flattening.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 3".

namespace CSharpDojo.D20_LinqJoinsFlatten;

public static class Flatten
{
    /// <summary>Every number from every inner sequence, in order.</summary>
    public static List<int> All(IEnumerable<IEnumerable<int>> groups)
    {
        throw new NotImplementedException("ex3: All is not implemented yet - edit this file.");
    }

    /// <summary>Every character of every word, in order.</summary>
    public static List<char> Letters(IEnumerable<string> words)
    {
        throw new NotImplementedException("ex3: Letters is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Every left paired with every right, as "a-1". The lefts move slowest,
    /// so the first left is paired with every right before the second left
    /// appears.
    /// </summary>
    public static List<string> Pairs(IEnumerable<string> lefts, IEnumerable<string> rights)
    {
        throw new NotImplementedException("ex3: Pairs is not implemented yet - edit this file.");
    }
}
