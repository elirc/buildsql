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
        throw new NotImplementedException("ex5: Equals is not implemented yet - edit this file.");
    }

    public int GetHashCode(string value)
    {
        throw new NotImplementedException("ex5: GetHashCode is not implemented yet - edit this file.");
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
        throw new NotImplementedException("ex5: FirstOfEach is not implemented yet - edit this file.");
    }
}
