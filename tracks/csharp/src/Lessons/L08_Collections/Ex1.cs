// 08_collections / ex1 - Dictionary: keys, lookups, and the missing-key question.
// See lessons/08_collections/README.md, "Exercise 1".

namespace CSharpDojo.L08_Collections;

public static class Words
{
    /// <summary>
    /// How many times each word appears, ignoring case and ignoring runs of
    /// spaces. "the cat the" gives { the: 2, cat: 1 }.
    /// </summary>
    public static Dictionary<string, int> Count(string text)
    {
        throw new NotImplementedException("ex1: Count is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The count for one word, or 0 when it is not in the dictionary at all.
    /// Indexing a Dictionary with a missing key throws, so do not do that.
    /// </summary>
    public static int CountOf(Dictionary<string, int> counts, string word)
    {
        throw new NotImplementedException("ex1: CountOf is not implemented yet - edit this file.");
    }
}
