// d19_linq_grouping / ex5 - folding a sequence into one value.
// See lessons/d19_linq_grouping/README.md, "Exercise 5".

namespace CSharpDojo.D19_LinqGrouping;

// The gate reads these. Written for you.
public record Summary(int Count, int Min, int Max, int Sum);

public static class Folds
{
    /// <summary>
    /// The total length of every part. Zero for an empty sequence. Uses the
    /// Aggregate overload that takes a seed.
    /// </summary>
    public static int TotalLength(IEnumerable<string> parts)
    {
        throw new NotImplementedException("ex5: TotalLength is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The path containing the most '/' characters; the first one wins a tie.
    /// Uses the seedless Aggregate overload, which throws
    /// InvalidOperationException for an empty sequence.
    /// </summary>
    public static string Deepest(IEnumerable<string> paths)
    {
        throw new NotImplementedException("ex5: Deepest is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Count, minimum, maximum and sum, gathered in a SINGLE pass. Throws
    /// InvalidOperationException for an empty sequence, because there is no
    /// minimum. Uses the Aggregate overload that takes a seed and a result
    /// selector.
    /// </summary>
    public static Summary Summarise(IEnumerable<int> numbers)
    {
        throw new NotImplementedException("ex5: Summarise is not implemented yet - edit this file.");
    }
}
