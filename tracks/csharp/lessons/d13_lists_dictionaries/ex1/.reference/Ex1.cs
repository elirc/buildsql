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
        int index = items.IndexOf(item);
        if (index < 0)
        {
            return false;
        }

        items.RemoveAt(index);
        items.Insert(0, item);
        return true;
    }

    /// <summary>
    /// Inserts <paramref name="item"/> immediately after <paramref name="anchor"/>.
    /// When the anchor is not in the list, the item goes on the end instead.
    /// </summary>
    public static void AddAfter(List<string> items, string anchor, string item)
    {
        int index = items.IndexOf(anchor);
        if (index < 0)
        {
            items.Add(item);
        }
        else
        {
            items.Insert(index + 1, item);
        }
    }

    /// <summary>Swaps the items at positions i and j.</summary>
    public static void Swap(List<string> items, int i, int j)
    {
        (items[i], items[j]) = (items[j], items[i]);
    }
}
