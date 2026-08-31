// d09_interfaces_contracts / ex8 - a decorator wears the same contract.
// See lessons/d09_interfaces_contracts/README.md, "Exercise 8".

namespace CSharpDojo.D09_InterfacesContracts;

public interface IPriceSource
{
    /// <summary>The price, or KeyNotFoundException when the sku is unknown.</summary>
    decimal PriceOf(string sku);
}

public class TablePriceSource : IPriceSource
{
    private readonly Dictionary<string, decimal> _prices = new Dictionary<string, decimal>();

    public TablePriceSource(IReadOnlyDictionary<string, decimal> prices)
    {
        foreach (KeyValuePair<string, decimal> pair in prices)
        {
            _prices[pair.Key] = pair.Value;
        }
    }

    /// <summary>How many times anyone has actually asked this source.</summary>
    public int Lookups { get; private set; }

    /// <summary>
    /// Counts the lookup - including the ones that fail - and then answers, or
    /// throws KeyNotFoundException.
    /// </summary>
    public decimal PriceOf(string sku)
    {
        Lookups++;
        if (!_prices.TryGetValue(sku, out decimal price))
        {
            throw new KeyNotFoundException($"No price for '{sku}'.");
        }

        return price;
    }
}

/// <summary>
/// Implements the SAME interface and wraps another one, so callers cannot tell
/// the difference.
/// </summary>
public class CachingPriceSource : IPriceSource
{
    private readonly IPriceSource _inner;
    private readonly Dictionary<string, decimal> _cache = new Dictionary<string, decimal>();

    public CachingPriceSource(IPriceSource inner)
    {
        _inner = inner;
    }

    /// <summary>Answers that came from the cache.</summary>
    public int Hits { get; private set; }

    /// <summary>Questions that had to be passed to the inner source.</summary>
    public int Misses { get; private set; }

    /// <summary>
    /// A cached sku is answered without troubling the inner source. Anything
    /// else is a miss: ask the inner source, remember the answer, return it.
    /// A FAILED lookup is not remembered - the exception travels to the caller
    /// and the next call asks again.
    /// </summary>
    public decimal PriceOf(string sku)
    {
        if (_cache.TryGetValue(sku, out decimal cached))
        {
            Hits++;
            return cached;
        }

        Misses++;
        decimal price = _inner.PriceOf(sku);
        _cache[sku] = price;
        return price;
    }
}
