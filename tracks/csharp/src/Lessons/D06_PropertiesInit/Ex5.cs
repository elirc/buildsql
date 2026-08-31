// d06_properties_init / ex5 - computed every time, or computed once?
// See lessons/d06_properties_init/README.md, "Exercise 5".

namespace CSharpDojo.D06_PropertiesInit;

public class Basket
{
    private readonly List<decimal> _prices = new List<decimal>();
    private decimal? _cachedTotal;

    /// <summary>How many prices are in the basket.</summary>
    public int Count => throw new NotImplementedException("ex5: Count is not implemented yet - edit this file.");

    /// <summary>
    /// The sum, worked out afresh on every read. This one never touches the
    /// cache and never changes TotalComputations.
    /// </summary>
    public decimal Total => throw new NotImplementedException("ex5: Total is not implemented yet - edit this file.");

    /// <summary>
    /// The same sum, but worked out at most once between changes. Reading it
    /// twice with nothing added in between must not add up the prices twice.
    /// </summary>
    public decimal CachedTotal =>
        throw new NotImplementedException("ex5: CachedTotal is not implemented yet - edit this file.");

    /// <summary>How many times CachedTotal has actually done the addition.</summary>
    public int TotalComputations { get; private set; }

    /// <summary>Add a price - and make sure the cache cannot answer stale.</summary>
    public void Add(decimal price)
    {
        throw new NotImplementedException("ex5: Add is not implemented yet - edit this file.");
    }
}
