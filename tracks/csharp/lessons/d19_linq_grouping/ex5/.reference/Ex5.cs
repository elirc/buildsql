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
        return parts.Aggregate(0, (total, part) => total + part.Length);
    }

    /// <summary>
    /// The path containing the most '/' characters; the first one wins a tie.
    /// Uses the seedless Aggregate overload, which throws
    /// InvalidOperationException for an empty sequence.
    /// </summary>
    public static string Deepest(IEnumerable<string> paths)
    {
        return paths.Aggregate((best, path) => Depth(path) > Depth(best) ? path : best);
    }

    /// <summary>
    /// Count, minimum, maximum and sum, gathered in a SINGLE pass. Throws
    /// InvalidOperationException for an empty sequence, because there is no
    /// minimum. Uses the Aggregate overload that takes a seed and a result
    /// selector.
    /// </summary>
    public static Summary Summarise(IEnumerable<int> numbers)
    {
        return numbers.Aggregate(
            (Count: 0, Min: int.MaxValue, Max: int.MinValue, Sum: 0),
            (state, number) => (
                state.Count + 1,
                Math.Min(state.Min, number),
                Math.Max(state.Max, number),
                state.Sum + number),
            state => state.Count == 0
                ? throw new InvalidOperationException("cannot summarise an empty sequence")
                : new Summary(state.Count, state.Min, state.Max, state.Sum));
    }

    private static int Depth(string path)
    {
        return path.Count(character => character == '/');
    }
}
