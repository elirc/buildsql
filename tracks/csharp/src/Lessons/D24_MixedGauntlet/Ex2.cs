// d24_mixed_gauntlet / ex2 - an interface, a constraint and a dictionary.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 2".

namespace CSharpDojo.D24_MixedGauntlet;

// The gate builds these. Written for you.
public interface IPriced
{
    decimal Price { get; }
}

public record Widget(string Name, decimal Price) : IPriced;

public static class Catalogue
{
    /// <summary>
    /// The cheapest item; the first of any tie. Throws
    /// InvalidOperationException for an empty sequence. Works for any type
    /// that has a price.
    /// </summary>
    public static T Cheapest<T>(IEnumerable<T> items)
        where T : IPriced
    {
        T? best = default;
        bool found = false;

        foreach (T item in items)
        {
            if (!found || item.Price < best!.Price)
            {
                best = item;
                found = true;
            }
        }

        if (!found)
        {
            throw new InvalidOperationException("cannot price an empty catalogue");
        }

        return best!;
    }

    /// <summary>The prices added up; zero for an empty sequence.</summary>
    public static decimal Total<T>(IEnumerable<T> items)
        where T : IPriced
    {
        return items.Sum(item => item.Price);
    }

    /// <summary>
    /// Name to price. A repeated name is not an error here - the LAST widget
    /// with that name wins.
    /// </summary>
    public static Dictionary<string, decimal> PriceList(IEnumerable<Widget> widgets)
    {
        throw new NotImplementedException("ex2: PriceList is not implemented yet - edit this file.");
    }
}
