// d24_mixed_gauntlet / ex1 - records, a query and some formatting.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 1".

namespace CSharpDojo.D24_MixedGauntlet;

// The gate builds these. Written for you.
public record Member(string Name, string Team, int Points);

public static class Roster
{
    /// <summary>
    /// "eng: ada(9), bob(4)" for each team that has at least one scoring
    /// member. Members with zero or fewer points are left out entirely; teams
    /// are ordered by name (ordinal) and members within a team by points
    /// descending, ties broken by name (ordinal).
    /// </summary>
    public static List<string> ByTeam(IEnumerable<Member> members)
    {
        throw new NotImplementedException("ex1: ByTeam is not implemented yet - edit this file.");
    }

    /// <summary>
    /// A copy of the member with extra points added, leaving the original
    /// untouched.
    /// </summary>
    public static Member Awarded(Member member, int extra)
    {
        throw new NotImplementedException("ex1: Awarded is not implemented yet - edit this file.");
    }
}
