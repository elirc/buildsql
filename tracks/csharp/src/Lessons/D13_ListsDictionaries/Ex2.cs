// d13_lists_dictionaries / ex2 - a counting dictionary with a remove rule.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 2".

namespace CSharpDojo.D13_ListsDictionaries;

public static class Stockroom
{
    /// <summary>
    /// Adds each delivered quantity to the stock line for its item, creating
    /// the line on first sight. A quantity of zero or less throws
    /// ArgumentOutOfRangeException.
    /// </summary>
    public static void Restock(Dictionary<string, int> stock, IEnumerable<(string Item, int Quantity)> delivery)
    {
        throw new NotImplementedException("ex2: Restock is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Takes <paramref name="quantity"/> of an item. Returns false (leaving the
    /// stock untouched) when the item is missing or there is not enough. When a
    /// take empties the line exactly, the key is removed entirely.
    /// </summary>
    public static bool Take(Dictionary<string, int> stock, string item, int quantity)
    {
        throw new NotImplementedException("ex2: Take is not implemented yet - edit this file.");
    }
}
