// d19_linq_grouping / ex4 - a key made of two things.
// See lessons/d19_linq_grouping/README.md, "Exercise 4".

namespace CSharpDojo.D19_LinqGrouping;

// The gate builds these. Written for you.
public record Visit(string Day, string Room, string Person);

public static class Schedules
{
    /// <summary>
    /// "Mon/A=2" for every day-and-room pair that has any visits, ordered by
    /// day then room, both ordinal ascending.
    /// </summary>
    public static List<string> CountByDayAndRoom(IEnumerable<Visit> visits)
    {
        return visits
            .GroupBy(visit => (visit.Day, visit.Room))
            .OrderBy(group => group.Key.Day, StringComparer.Ordinal)
            .ThenBy(group => group.Key.Room, StringComparer.Ordinal)
            .Select(group => $"{group.Key.Day}/{group.Key.Room}={group.Count()}")
            .ToList();
    }

    /// <summary>
    /// The people who were seen in more than one distinct room, ordered by
    /// name (ordinal, ascending).
    /// </summary>
    public static List<string> RoomHoppers(IEnumerable<Visit> visits)
    {
        return visits
            .GroupBy(visit => visit.Person)
            .Where(group => group.Select(visit => visit.Room).Distinct().Count() > 1)
            .Select(group => group.Key)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();
    }
}
