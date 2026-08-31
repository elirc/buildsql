// d18_linq_filtering / ex2 - asking a sequence yes-or-no questions.
// See lessons/d18_linq_filtering/README.md, "Exercise 2".

namespace CSharpDojo.D18_LinqFiltering;

public static class Questions
{
    /// <summary>True when at least one number is below zero.</summary>
    public static bool AnyNegative(IEnumerable<int> numbers)
    {
        return numbers.Any(number => number < 0);
    }

    /// <summary>True when every number is above zero - and for an empty sequence.</summary>
    public static bool AllPositive(IEnumerable<int> numbers)
    {
        return numbers.All(number => number > 0);
    }

    /// <summary>True when the sequence has anything in it at all.</summary>
    public static bool HasAny(IEnumerable<int> numbers)
    {
        return numbers.Any();
    }

    /// <summary>How many numbers fall between low and high, both ends included.</summary>
    public static int CountBetween(IEnumerable<int> numbers, int low, int high)
    {
        return numbers.Count(number => number >= low && number <= high);
    }
}
