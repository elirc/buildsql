// d13_lists_dictionaries / ex6 - a tuple is a perfectly good key.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 6".

namespace CSharpDojo.D13_ListsDictionaries;

public static class Fares
{
    /// <summary>Records the price of the route from -> to, overwriting any earlier price.</summary>
    public static void Set(Dictionary<(string From, string To), decimal> fares, string from, string to, decimal price)
    {
        throw new NotImplementedException("ex6: Set is not implemented yet - edit this file.");
    }

    /// <summary>The price of the route from -> to, or null when it is not on file.</summary>
    public static decimal? PriceOf(Dictionary<(string From, string To), decimal> fares, string from, string to)
    {
        throw new NotImplementedException("ex6: PriceOf is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The destination of the cheapest route leaving <paramref name="origin"/>,
    /// ties broken by destination A-Z; null when no route leaves it.
    /// </summary>
    public static string? CheapestFrom(Dictionary<(string From, string To), decimal> fares, string origin)
    {
        throw new NotImplementedException("ex6: CheapestFrom is not implemented yet - edit this file.");
    }
}
