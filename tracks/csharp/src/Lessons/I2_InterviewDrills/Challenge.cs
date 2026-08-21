// i2_interview_drills / challenge - the 45-minute task.
// See lessons/i2_interview_drills/README.md, "Challenge".

namespace CSharpDojo.I2_InterviewDrills;

public record OrderLine(string Sku, int Quantity, decimal UnitPrice);

/// <summary>
/// An in-memory order service: place orders, price them, report on them, and
/// shut down cleanly.
/// </summary>
public sealed class OrderService : IDisposable
{
    private readonly Dictionary<string, (string Customer, List<OrderLine> Lines)> _orders = new();
    private int _nextId = 1;
    private bool _disposed;

    /// <summary>
    /// Store the order and return its id: "ORD-1" for the first, "ORD-2" for
    /// the next, and so on.
    ///
    /// A blank customer or an order with no lines is an ArgumentException.
    /// A line with a quantity of zero or less is an ArgumentOutOfRangeException.
    /// Nothing may be placed after the service is disposed.
    /// </summary>
    public string Place(string customer, IReadOnlyList<OrderLine> lines)
    {
        throw new NotImplementedException("challenge: Place is not implemented yet - edit this file.");
    }

    /// <summary>
    /// What the order costs: quantity x unit price, summed. An id that was
    /// never issued is a KeyNotFoundException.
    /// </summary>
    public decimal TotalFor(string orderId)
    {
        throw new NotImplementedException("challenge: TotalFor is not implemented yet - edit this file.");
    }

    /// <summary>
    /// "customer: total" for the biggest spenders, largest first and ties
    /// broken by name A-Z, at most <paramref name="count"/> of them.
    /// </summary>
    public List<string> TopCustomers(int count)
    {
        throw new NotImplementedException("challenge: TopCustomers is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Drop everything. Calling any other member afterwards is an
    /// ObjectDisposedException; disposing again is harmless.
    /// </summary>
    public void Dispose()
    {
        throw new NotImplementedException("challenge: Dispose is not implemented yet - edit this file.");
    }
}
