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
        throw new NotImplementedException("ex7: TopTwoPerGame is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The players who are in the top two of more than one game, ordered by
    /// name (ordinal, ascending).
    /// </summary>
    public static List<string> Consistent(IEnumerable<Score> scores)
    {
        throw new NotImplementedException("ex7: Consistent is not implemented yet - edit this file.");
    }
}
