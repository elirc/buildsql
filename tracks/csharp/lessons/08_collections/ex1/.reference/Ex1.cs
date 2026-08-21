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
        Dictionary<string, int> counts = new Dictionary<string, int>();
        foreach (string word in text.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            string key = word.ToLowerInvariant();
            counts.TryGetValue(key, out int soFar);
            counts[key] = soFar + 1;
        }

        return counts;
    }

    /// <summary>
    /// The count for one word, or 0 when it is not in the dictionary at all.
    /// Indexing a Dictionary with a missing key throws, so do not do that.
    /// </summary>
    public static int CountOf(Dictionary<string, int> counts, string word)
    {
        return counts.TryGetValue(word, out int count) ? count : 0;
    }
}
