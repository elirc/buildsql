// d24_mixed_gauntlet / ex5 - your own comparer, streamed through an iterator.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 5".

namespace CSharpDojo.D24_MixedGauntlet;

/// <summary>
/// Treats two strings as equal when they differ only in case, using the
/// ordinal (culture-free) comparison.
/// </summary>
public sealed class CaseInsensitive : IEqualityComparer<string>
{
    public bool Equals(string? x, string? y)
    {
        return string.Equals(x, y, StringComparison.OrdinalIgnoreCase);
    }

    public int GetHashCode(string value)
    {
        return value.ToUpperInvariant().GetHashCode();
    }
}

public static class Streams
{
    /// <summary>
    /// Yields the first occurrence of each distinct item, comparing with the
    /// supplied comparer, and reads the source only as far as the caller asks.
    /// Nothing is read until the result is enumerated.
    /// </summary>
    public static IEnumerable<string> FirstOfEach(
        IEnumerable<string> source, IEqualityComparer<string> comparer)
    {
        HashSet<string> seen = new HashSet<string>(comparer);
        foreach (string item in source)
        {
            if (seen.Add(item))
            {
                yield return item;
            }
        }
    }
}
