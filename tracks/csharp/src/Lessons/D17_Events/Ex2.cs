// d17_events / ex2 - an event that carries data.
// See lessons/d17_events/README.md, "Exercise 2".

namespace CSharpDojo.D17_Events;

public class StockLowEventArgs : EventArgs
{
    public StockLowEventArgs(string sku, int remaining)
    {
        throw new NotImplementedException("ex2: StockLowEventArgs is not implemented yet - edit this file.");
    }

    public string Sku => throw new NotImplementedException("ex2: Sku is not implemented yet - edit this file.");

    public int Remaining => throw new NotImplementedException("ex2: Remaining is not implemented yet - edit this file.");
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
        throw new NotImplementedException("ex2: Receive is not implemented yet - edit this file.");
    }

    /// <summary>The count for a SKU; zero for one that was never received.</summary>
    public int Remaining(string sku)
    {
        throw new NotImplementedException("ex2: Remaining is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Removes stock. Throws InvalidOperationException when there is not
    /// enough, changing nothing. On success, raises StockLow when the
    /// remaining count is strictly below Threshold.
    /// </summary>
    public void Ship(string sku, int quantity)
    {
        throw new NotImplementedException("ex2: Ship is not implemented yet - edit this file.");
    }
}
