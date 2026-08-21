// 05_interfaces / review1 - one interface, two strategies, one consumer.
// See lessons/05_interfaces/README.md, "Review".

namespace CSharpDojo.L05_Interfaces;

public interface IShippingRate
{
    decimal For(int weightGrams);
}

/// <summary>The same price whatever it weighs.</summary>
public class FlatRate : IShippingRate
{
    public FlatRate(decimal amount)
    {
        Amount = amount;
    }

    public decimal Amount { get; }

    public decimal For(int weightGrams)
    {
        throw new NotImplementedException("review1: FlatRate.For is not implemented yet - edit this file.");
    }
}

/// <summary>2 per kilogram or part of a kilogram, and never less than 2.</summary>
public class ByWeight : IShippingRate
{
    public decimal For(int weightGrams)
    {
        throw new NotImplementedException("review1: ByWeight.For is not implemented yet - edit this file.");
    }
}

public class Order
{
    private readonly IShippingRate _rate;

    public Order(IShippingRate rate)
    {
        _rate = rate;
    }

    /// <summary>Goods plus whatever the injected policy charges to ship them.</summary>
    public decimal TotalFor(decimal goods, int weightGrams)
    {
        throw new NotImplementedException("review1: TotalFor is not implemented yet - edit this file.");
    }
}
