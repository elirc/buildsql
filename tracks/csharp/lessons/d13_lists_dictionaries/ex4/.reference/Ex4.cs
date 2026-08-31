// d13_lists_dictionaries / ex4 - sorting in place versus sorting a copy.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 4".

namespace CSharpDojo.D13_ListsDictionaries;

public record Entry(string Player, int Score);

public static class Leaderboard
{
    /// <summary>
    /// Rearranges the caller's list: highest score first, ties broken by
    /// player name A-Z. Uses List.Sort with a Comparison.
    /// </summary>
    public static void SortInPlace(List<Entry> entries)
    {
        entries.Sort((a, b) => a.Score != b.Score
            ? b.Score.CompareTo(a.Score)
            : string.CompareOrdinal(a.Player, b.Player));
    }

    /// <summary>
    /// Returns a NEW list in the same order (score descending, name A-Z),
    /// leaving the caller's list exactly as it was.
    /// </summary>
    public static List<Entry> Ranked(IEnumerable<Entry> entries)
    {
        return entries
            .OrderByDescending(e => e.Score)
            .ThenBy(e => e.Player)
            .ToList();
    }
}
