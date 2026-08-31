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
        throw new NotImplementedException("ex1: LongWordsUpper is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Every word with a 1-based position in front of it: "1. ada", "2. bob".
    /// </summary>
    public static List<string> Numbered(IEnumerable<string> words)
    {
        throw new NotImplementedException("ex1: Numbered is not implemented yet - edit this file.");
    }
}
