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
        ObjectDisposedException.ThrowIf(_disposed, this);

        if (string.IsNullOrWhiteSpace(customer))
        {
            throw new ArgumentException("An order needs a customer.", nameof(customer));
        }

        if (lines.Count == 0)
        {
            throw new ArgumentException("An order needs at least one line.", nameof(lines));
        }

        foreach (OrderLine line in lines)
        {
            if (line.Quantity <= 0)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(lines), line.Quantity, $"Line '{line.Sku}' must order at least one unit.");
            }
        }

        string id = $"ORD-{_nextId}";
        _nextId++;
        _orders[id] = (customer, lines.ToList());
        return id;
    }

    /// <summary>
    /// What the order costs: quantity x unit price, summed. An id that was
    /// never issued is a KeyNotFoundException.
    /// </summary>
    public decimal TotalFor(string orderId)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        if (!_orders.TryGetValue(orderId, out (string Customer, List<OrderLine> Lines) order))
        {
            throw new KeyNotFoundException($"No such order: {orderId}");
        }

        return order.Lines.Sum(line => line.Quantity * line.UnitPrice);
    }

    /// <summary>
    /// "customer: total" for the biggest spenders, largest first and ties
    /// broken by name A-Z, at most <paramref name="count"/> of them.
    /// </summary>
    public List<string> TopCustomers(int count)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        return _orders.Values
            .GroupBy(order => order.Customer)
            .Select(group => new
            {
                Customer = group.Key,
                Total = group.Sum(order => order.Lines.Sum(line => line.Quantity * line.UnitPrice)),
            })
            .OrderByDescending(row => row.Total)
            .ThenBy(row => row.Customer)
            .Take(count)
            .Select(row => $"{row.Customer}: {row.Total}")
            .ToList();
    }

    /// <summary>
    /// Drop everything. Calling any other member afterwards is an
    /// ObjectDisposedException; disposing again is harmless.
    /// </summary>
    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;
        _orders.Clear();
    }
}
