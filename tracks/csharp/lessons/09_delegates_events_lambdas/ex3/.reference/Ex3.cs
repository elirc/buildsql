// 09_delegates_events_lambdas / ex3 - events: broadcasting a change.
// See lessons/09_delegates_events_lambdas/README.md, "Exercise 3".

namespace CSharpDojo.L09_DelegatesEventsLambdas;

public class PriceChangedEventArgs : EventArgs
{
    public PriceChangedEventArgs(decimal oldPrice, decimal newPrice)
    {
        OldPrice = oldPrice;
        NewPrice = newPrice;
    }

    public decimal OldPrice { get; }

    public decimal NewPrice { get; }
}

public class StockTicker
{
    /// <summary>Anyone may subscribe; nobody outside may raise it.</summary>
    public event EventHandler<PriceChangedEventArgs>? PriceChanged;

    public decimal Price { get; private set; }

    /// <summary>
    /// Record the new price and tell the subscribers - but only when the price
    /// actually moved, and without crashing when nobody is listening.
    /// </summary>
    public void Update(decimal newPrice)
    {
        if (newPrice == Price)
        {
            return;
        }

        decimal oldPrice = Price;
        Price = newPrice;
        PriceChanged?.Invoke(this, new PriceChangedEventArgs(oldPrice, newPrice));
    }
}
