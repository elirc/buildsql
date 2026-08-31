// d13_lists_dictionaries / ex3 - Add, the indexer, and TryAdd.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 3".

namespace CSharpDojo.D13_ListsDictionaries;

public static class Roster
{
    /// <summary>Puts a person in an office, moving them if they already had one.</summary>
    public static void Assign(Dictionary<string, string> offices, string person, string office)
    {
        throw new NotImplementedException("ex3: Assign is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Puts a person in an office only if they have none yet. Returns true when
    /// the assignment stuck, false (changing nothing) when they were already placed.
    /// </summary>
    public static bool AssignNew(Dictionary<string, string> offices, string person, string office)
    {
        throw new NotImplementedException("ex3: AssignNew is not implemented yet - edit this file.");
    }

    /// <summary>Everyone assigned to <paramref name="office"/>, A-Z.</summary>
    public static List<string> OccupantsOf(Dictionary<string, string> offices, string office)
    {
        throw new NotImplementedException("ex3: OccupantsOf is not implemented yet - edit this file.");
    }
}
