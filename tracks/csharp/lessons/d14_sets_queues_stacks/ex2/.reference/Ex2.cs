// d14_sets_queues_stacks / ex2 - set algebra on two attendance lists.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 2".

namespace CSharpDojo.D14_SetsQueuesStacks;

public static class Attendance
{
    /// <summary>Everyone who came on BOTH days, A-Z.</summary>
    public static List<string> BothDays(IEnumerable<string> day1, IEnumerable<string> day2)
    {
        HashSet<string> result = new HashSet<string>(day1);
        result.IntersectWith(day2);
        return result.OrderBy(name => name).ToList();
    }

    /// <summary>Everyone who came on day 1 but NOT day 2, A-Z.</summary>
    public static List<string> OnlyFirstDay(IEnumerable<string> day1, IEnumerable<string> day2)
    {
        HashSet<string> result = new HashSet<string>(day1);
        result.ExceptWith(day2);
        return result.OrderBy(name => name).ToList();
    }

    /// <summary>How many distinct people came at all, either day.</summary>
    public static int TotalDistinct(IEnumerable<string> day1, IEnumerable<string> day2)
    {
        HashSet<string> everyone = new HashSet<string>(day1);
        everyone.UnionWith(day2);
        return everyone.Count;
    }
}
