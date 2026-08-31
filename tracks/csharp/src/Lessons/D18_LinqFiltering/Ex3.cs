// d18_linq_filtering / ex3 - picking one element, and what happens when you cannot.
// See lessons/d18_linq_filtering/README.md, "Exercise 3".

namespace CSharpDojo.D18_LinqFiltering;

public static class Picks
{
    /// <summary>
    /// The first word beginning with that letter. Throws
    /// InvalidOperationException when there is none.
    /// </summary>
    public static string FirstStartingWith(IEnumerable<string> words, char letter)
    {
        throw new NotImplementedException("ex3: FirstStartingWith is not implemented yet - edit this file.");
    }

    /// <summary>The same, but null when there is none.</summary>
    public static string? FirstStartingWithOrNull(IEnumerable<string> words, char letter)
    {
        throw new NotImplementedException("ex3: FirstStartingWithOrNull is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The one and only word beginning with that letter. Throws
    /// InvalidOperationException when there is none - and also when there is
    /// more than one.
    /// </summary>
    public static string OnlyStartingWith(IEnumerable<string> words, char letter)
    {
        throw new NotImplementedException("ex3: OnlyStartingWith is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The first word beginning with that letter, or the fallback text when
    /// there is none.
    /// </summary>
    public static string FirstStartingWithOr(IEnumerable<string> words, char letter, string fallback)
    {
        throw new NotImplementedException("ex3: FirstStartingWithOr is not implemented yet - edit this file.");
    }
}
