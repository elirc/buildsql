// d19_linq_grouping / ex7 - top N inside every group.
// See lessons/d19_linq_grouping/README.md, "Exercise 7".

namespace CSharpDojo.D19_LinqGrouping;

// The gate builds these. Written for you.
public record Score(string Player, string Game, int Points);

public static class Leaderboards
{
    /// <summary>
    /// "chess:ada,bob" for each game, ordered by game (ordinal), naming the
    /// two highest-scoring players with ties broken by player name (ordinal,
    /// ascending). A game with only one player names only that one.
    /// </summary>
    public static List<string> TopTwoPerGame(IEnumerable<Score> scores)
    {
        return scores
            .GroupBy(score => score.Game)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => $"{group.Key}:{string.Join(",", TopTwo(group))}")
            .ToList();
    }

    /// <summary>
    /// The players who are in the top two of more than one game, ordered by
    /// name (ordinal, ascending).
    /// </summary>
    public static List<string> Consistent(IEnumerable<Score> scores)
    {
        return scores
            .GroupBy(score => score.Game)
            .SelectMany(group => TopTwo(group))
            .GroupBy(player => player)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .OrderBy(player => player, StringComparer.Ordinal)
            .ToList();
    }

    private static IEnumerable<string> TopTwo(IEnumerable<Score> group)
    {
        return group
            .OrderByDescending(score => score.Points)
            .ThenBy(score => score.Player, StringComparer.Ordinal)
            .Take(2)
            .Select(score => score.Player);
    }
}
