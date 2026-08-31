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
        foreach ((string item, int quantity) in delivery)
        {
            if (quantity <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(delivery), quantity,
                    "every delivered quantity must be positive");
            }

            stock[item] = stock.GetValueOrDefault(item) + quantity;
        }
    }

    /// <summary>
    /// Takes <paramref name="quantity"/> of an item. Returns false (leaving the
    /// stock untouched) when the item is missing or there is not enough. When a
    /// take empties the line exactly, the key is removed entirely.
    /// </summary>
    public static bool Take(Dictionary<string, int> stock, string item, int quantity)
    {
        if (!stock.TryGetValue(item, out int available) || available < quantity)
        {
            return false;
        }

        if (available == quantity)
        {
            stock.Remove(item);
        }
        else
        {
            stock[item] = available - quantity;
        }

        return true;
    }
}
