// d13_lists_dictionaries / ex6 - a tuple is a perfectly good key.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 6".

namespace CSharpDojo.D13_ListsDictionaries;

public static class Fares
{
    /// <summary>Records the price of the route from -> to, overwriting any earlier price.</summary>
    public static void Set(Dictionary<(string From, string To), decimal> fares, string from, string to, decimal price)
    {
        fares[(from, to)] = price;
    }

    /// <summary>The price of the route from -> to, or null when it is not on file.</summary>
    public static decimal? PriceOf(Dictionary<(string From, string To), decimal> fares, string from, string to)
    {
        return fares.TryGetValue((from, to), out decimal price) ? price : null;
    }

    /// <summary>
    /// The destination of the cheapest route leaving <paramref name="origin"/>,
    /// ties broken by destination A-Z; null when no route leaves it.
    /// </summary>
    public static string? CheapestFrom(Dictionary<(string From, string To), decimal> fares, string origin)
    {
        return fares
            .Where(pair => pair.Key.From == origin)
            .OrderBy(pair => pair.Value)
            .ThenBy(pair => pair.Key.To)
            .Select(pair => pair.Key.To)
            .FirstOrDefault();
    }
}
