// d18_linq_filtering / ex5 - duplicates, and a stable order.
// See lessons/d18_linq_filtering/README.md, "Exercise 5".

namespace CSharpDojo.D18_LinqFiltering;

// The gate builds these. Written for you.
public record Ticket(string Id, string Owner, int Priority);

public static class Dedupe
{
    /// <summary>Every owner once, in the order each was first seen.</summary>
    public static List<string> UniqueOwners(IEnumerable<Ticket> tickets)
    {
        throw new NotImplementedException("ex5: UniqueOwners is not implemented yet - edit this file.");
    }

    /// <summary>
    /// One ticket per owner - the first one that owner appears on - in the
    /// order the owners were first seen.
    /// </summary>
    public static List<Ticket> OnePerOwner(IEnumerable<Ticket> tickets)
    {
        throw new NotImplementedException("ex5: OnePerOwner is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Ordered by Priority ascending, with ties broken by Id using an ordinal
    /// string comparison.
    /// </summary>
    public static List<Ticket> Ranked(IEnumerable<Ticket> tickets)
    {
        throw new NotImplementedException("ex5: Ranked is not implemented yet - edit this file.");
    }
}
