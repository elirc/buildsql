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
        Dictionary<char, List<string>> groups = new Dictionary<char, List<string>>();
        foreach (string word in words)
        {
            char key = word[0];
            if (!groups.TryGetValue(key, out List<string>? group))
            {
                group = new List<string>();
                groups[key] = group;
            }

            group.Add(word);
        }

        return groups;
    }

    /// <summary>
    /// The group for one letter, or an EMPTY list when there is none. Never
    /// null, and never an exception.
    /// </summary>
    public static List<string> For(Dictionary<char, List<string>> groups, char letter)
    {
        return groups.TryGetValue(letter, out List<string>? group) ? group : new List<string>();
    }
}
