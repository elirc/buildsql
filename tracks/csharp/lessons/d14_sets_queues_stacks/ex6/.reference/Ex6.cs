// d14_sets_queues_stacks / ex6 - subset, overlap, and set equality.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 6".

namespace CSharpDojo.D14_SetsQueuesStacks;

public static class Access
{
    /// <summary>True when the user holds AT LEAST ONE of the roles.</summary>
    public static bool CanView(IEnumerable<string> userRoles, IEnumerable<string> anyOf)
    {
        return new HashSet<string>(userRoles).Overlaps(anyOf);
    }

    /// <summary>True when the user holds EVERY one of the roles.</summary>
    public static bool CanPublish(IEnumerable<string> userRoles, IEnumerable<string> allOf)
    {
        return new HashSet<string>(userRoles).IsSupersetOf(allOf);
    }

    /// <summary>
    /// True when the two role lists name the same set - order and duplicates
    /// do not matter.
    /// </summary>
    public static bool SameCrew(IEnumerable<string> first, IEnumerable<string> second)
    {
        return new HashSet<string>(first).SetEquals(second);
    }
}
