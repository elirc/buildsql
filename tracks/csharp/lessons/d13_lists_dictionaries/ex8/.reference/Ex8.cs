// d13_lists_dictionaries / ex8 - two numbers that sum to a target.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 8".

namespace CSharpDojo.D13_ListsDictionaries;

public static class PairFinder
{
    /// <summary>
    /// The positions (First, Second) of two DIFFERENT positions whose values
    /// add up to <paramref name="target"/>, or null when no pair does.
    /// The winning pair is the one whose Second position is earliest; its First
    /// is the earliest earlier position that completes it. One pass, one
    /// dictionary - no nested loops.
    /// </summary>
    public static (int First, int Second)? FirstPairSummingTo(IReadOnlyList<int> numbers, int target)
    {
        // value -> the earliest position it was seen at.
        Dictionary<int, int> earliest = new Dictionary<int, int>();

        for (int i = 0; i < numbers.Count; i++)
        {
            if (earliest.TryGetValue(target - numbers[i], out int j))
            {
                return (j, i);
            }

            earliest.TryAdd(numbers[i], i);
        }

        return null;
    }

    /// <summary>Whether any such pair exists.</summary>
    public static bool HasPairSummingTo(IReadOnlyList<int> numbers, int target)
    {
        return FirstPairSummingTo(numbers, target) is not null;
    }
}
