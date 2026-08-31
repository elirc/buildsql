// d18_linq_filtering / ex1 - restrict, then project.
// See lessons/d18_linq_filtering/README.md, "Exercise 1".

namespace CSharpDojo.D18_LinqFiltering;

public static class Restrict
{
    /// <summary>
    /// The words at least <paramref name="minLength"/> characters long, upper
    /// cased with ToUpperInvariant, in the order they arrived.
    /// </summary>
    public static List<string> LongWordsUpper(IEnumerable<string> words, int minLength)
    {
        return words
            .Where(word => word.Length >= minLength)
            .Select(word => word.ToUpperInvariant())
            .ToList();
    }

    /// <summary>
    /// Every word with a 1-based position in front of it: "1. ada", "2. bob".
    /// </summary>
    public static List<string> Numbered(IEnumerable<string> words)
    {
        return words.Select((word, index) => $"{index + 1}. {word}").ToList();
    }
}
