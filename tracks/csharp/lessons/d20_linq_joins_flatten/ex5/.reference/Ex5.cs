// d20_linq_joins_flatten / ex5 - pairing up, and set arithmetic.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 5".

namespace CSharpDojo.D20_LinqJoinsFlatten;

public static class Combine
{
    /// <summary>
    /// "ada=10" for each name paired with the score in the same position.
    /// Stops when either sequence runs out.
    /// </summary>
    public static List<string> Labelled(IEnumerable<string> names, IEnumerable<int> scores)
    {
        return names.Zip(scores, (name, score) => $"{name}={score}").ToList();
    }

    /// <summary>The values in both sequences, each once, in first-sequence order.</summary>
    public static List<int> InBoth(IEnumerable<int> first, IEnumerable<int> second)
    {
        return first.Intersect(second).ToList();
    }

    /// <summary>The values in the first sequence but not the second, each once.</summary>
    public static List<int> OnlyInFirst(IEnumerable<int> first, IEnumerable<int> second)
    {
        return first.Except(second).ToList();
    }

    /// <summary>Every value from either sequence, each once, first sequence first.</summary>
    public static List<int> EitherOne(IEnumerable<int> first, IEnumerable<int> second)
    {
        return first.Union(second).ToList();
    }

    /// <summary>Every value from both sequences, duplicates and all, in order.</summary>
    public static List<int> BothEndToEnd(IEnumerable<int> first, IEnumerable<int> second)
    {
        return first.Concat(second).ToList();
    }
}
