// 05_interfaces / ex1 - one contract, two unrelated implementers.
// See lessons/05_interfaces/README.md, "Exercise 1".

namespace CSharpDojo.L05_Interfaces;

/// <summary>Anything that costs money. No base class, no shared state.</summary>
public interface IPriced
{
    string Label { get; }

    decimal Price { get; }
}

public class Book : IPriced
{
    public Book(string title, decimal price)
    {
        Title = title;
        Price = price;
    }

    public string Title { get; }

    public decimal Price { get; }

    /// <summary>A book's label is its title in quotes: "Dune".</summary>
    public string Label =>
        throw new NotImplementedException("ex1: Book.Label is not implemented yet - edit this file.");
}

public class Subscription : IPriced
{
    public Subscription(string service, decimal monthly, int months)
    {
        Service = service;
        Monthly = monthly;
        Months = months;
    }

    public string Service { get; }

    public decimal Monthly { get; }

    public int Months { get; }

    /// <summary>"news x3"</summary>
    public string Label =>
        throw new NotImplementedException("ex1: Subscription.Label is not implemented yet - edit this file.");

    /// <summary>The whole subscription, not one month of it.</summary>
    public decimal Price =>
        throw new NotImplementedException("ex1: Subscription.Price is not implemented yet - edit this file.");
}

public static class Basket
{
    /// <summary>Add up anything priced, whatever it actually is.</summary>
    public static decimal Total(IEnumerable<IPriced> items)
    {
        throw new NotImplementedException("ex1: Total is not implemented yet - edit this file.");
    }
}
