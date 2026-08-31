// d13_lists_dictionaries / ex1 - list surgery by position.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 1".

namespace CSharpDojo.D13_ListsDictionaries;

public static class Agenda
{
    /// <summary>
    /// Moves <paramref name="item"/> to the front of the list, keeping every
    /// other item in its current order. Returns true when the item was found,
    /// false (and no change to the list) when it was not.
    /// </summary>
    public static bool MoveToTop(List<string> items, string item)
    {
        throw new NotImplementedException("ex1: MoveToTop is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Inserts <paramref name="item"/> immediately after <paramref name="anchor"/>.
    /// When the anchor is not in the list, the item goes on the end instead.
    /// </summary>
    public static void AddAfter(List<string> items, string anchor, string item)
    {
        throw new NotImplementedException("ex1: AddAfter is not implemented yet - edit this file.");
    }

    /// <summary>Swaps the items at positions i and j.</summary>
    public static void Swap(List<string> items, int i, int j)
    {
        throw new NotImplementedException("ex1: Swap is not implemented yet - edit this file.");
    }
}
