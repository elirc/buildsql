// 10_linq_1 / ex3 - deferred execution: a query is a plan, not a result.
// See lessons/10_linq_1/README.md, "Exercise 3".

namespace CSharpDojo.L10_Linq1;

public static class Deferred
{
    /// <summary>
    /// A query for the orders worth at least <paramref name="minimum"/>, built
    /// but NOT run: nothing may touch the source until somebody enumerates the
    /// result. Do not materialise it.
    /// </summary>
    public static IEnumerable<Order> Query(IEnumerable<Order> orders, decimal minimum)
    {
        return orders.Where(order => order.Amount >= minimum);
    }

    /// <summary>
    /// The same orders, but read from the source exactly ONCE, right now, and
    /// held. Later changes to the source must not show up here.
    /// </summary>
    public static IReadOnlyList<Order> Snapshot(IEnumerable<Order> orders, decimal minimum)
    {
        return orders.Where(order => order.Amount >= minimum).ToList();
    }

    /// <summary>
    /// The total of a sequence, reading it exactly once however many values it
    /// needs - the count and the sum come from the same pass.
    /// </summary>
    public static (int Count, decimal Total) CountAndTotal(IEnumerable<Order> orders)
    {
        int count = 0;
        decimal total = 0m;
        foreach (Order order in orders)
        {
            count++;
            total += order.Amount;
        }

        return (count, total);
    }
}
