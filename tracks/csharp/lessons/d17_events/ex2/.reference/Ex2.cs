// d17_events / ex2 - an event that carries data.
// See lessons/d17_events/README.md, "Exercise 2".

namespace CSharpDojo.D17_Events;

public class StockLowEventArgs : EventArgs
{
    public StockLowEventArgs(string sku, int remaining)
    {
        Sku = sku;
        Remaining = remaining;
    }

    public string Sku { get; }

    public int Remaining { get; }
}

public class Warehouse
{
    private readonly Dictionary<string, int> _stock = new Dictionary<string, int>();

    public Warehouse(int threshold)
    {
        Threshold = threshold;
    }

    public int Threshold { get; }

    /// <summary>Raised after any shipment that leaves the count below Threshold.</summary>
    public event EventHandler<StockLowEventArgs>? StockLow;

    /// <summary>Written for you: true while anybody is listening.</summary>
    public bool HasListeners => StockLow is not null;

    /// <summary>Adds stock. Unknown SKUs start at zero.</summary>
    public void Receive(string sku, int quantity)
    {
        _stock[sku] = Remaining(sku) + quantity;
    }

    /// <summary>The count for a SKU; zero for one that was never received.</summary>
    public int Remaining(string sku)
    {
        return _stock.TryGetValue(sku, out int quantity) ? quantity : 0;
    }

    /// <summary>
    /// Removes stock. Throws InvalidOperationException when there is not
    /// enough, changing nothing. On success, raises StockLow when the
    /// remaining count is strictly below Threshold.
    /// </summary>
    public void Ship(string sku, int quantity)
    {
        int remaining = Remaining(sku);
        if (quantity > remaining)
        {
            throw new InvalidOperationException($"cannot ship {quantity} of {sku}: only {remaining} in stock");
        }

        remaining -= quantity;
        _stock[sku] = remaining;

        if (remaining < Threshold)
        {
            StockLow?.Invoke(this, new StockLowEventArgs(sku, remaining));
        }
    }
}
