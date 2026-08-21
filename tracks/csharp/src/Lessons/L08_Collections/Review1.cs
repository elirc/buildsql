// 08_collections / review1 - a dictionary of lists, and the missing-key question again.
// See lessons/08_collections/README.md, "Review".

namespace CSharpDojo.L08_Collections;

public static class Grouping
{
    /// <summary>
    /// Group the words by their first letter, keeping each group in the order
    /// the words arrived. Words are assumed non-empty.
    /// </summary>
    public static Dictionary<char, List<string>> ByFirstLetter(IEnumerable<string> words)
    {
        throw new NotImplementedException("review1: ByFirstLetter is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The group for one letter, or an EMPTY list when there is none. Never
    /// null, and never an exception.
    /// </summary>
    public static List<string> For(Dictionary<char, List<string>> groups, char letter)
    {
        throw new NotImplementedException("review1: For is not implemented yet - edit this file.");
    }
}
