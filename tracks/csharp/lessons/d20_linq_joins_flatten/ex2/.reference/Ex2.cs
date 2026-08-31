// d20_linq_joins_flatten / ex2 - the left join, spelled out.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 2".

namespace CSharpDojo.D20_LinqJoinsFlatten;

public static class LeftJoins
{
    /// <summary>
    /// "ada:book,pen" for EVERY customer, ordered by name (ordinal), with
    /// "(none)" in place of the list when that customer has no orders. Each
    /// customer's products stay in the order the orders arrived.
    /// </summary>
    public static List<string> CustomerBasket(
        IEnumerable<Customer> customers, IEnumerable<Order> orders)
    {
        return customers
            .GroupJoin(
                orders,
                customer => customer.Id,
                order => order.CustomerId,
                (customer, theirOrders) => new
                {
                    customer.Name,
                    Products = theirOrders.Select(order => order.Product).ToList(),
                })
            .OrderBy(row => row.Name, StringComparer.Ordinal)
            .Select(row => $"{row.Name}:{(row.Products.Count == 0 ? "(none)" : string.Join(",", row.Products))}")
            .ToList();
    }

    /// <summary>
    /// The names of the customers who have no orders at all, ordered by name
    /// (ordinal).
    /// </summary>
    public static List<string> Idle(IEnumerable<Customer> customers, IEnumerable<Order> orders)
    {
        return customers
            .GroupJoin(
                orders,
                customer => customer.Id,
                order => order.CustomerId,
                (customer, theirOrders) => new { customer.Name, Any = theirOrders.Any() })
            .Where(row => !row.Any)
            .Select(row => row.Name)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();
    }

    /// <summary>
    /// One row per customer-and-order pair, plus one row per customer with no
    /// orders: "ada/book" or "zoe/-". Ordered by name (ordinal), then by
    /// product (ordinal). This is the flattened left join.
    /// </summary>
    public static List<string> EveryRow(IEnumerable<Customer> customers, IEnumerable<Order> orders)
    {
        return customers
            .GroupJoin(
                orders,
                customer => customer.Id,
                order => order.CustomerId,
                (customer, theirOrders) => new { customer.Name, Orders = theirOrders })
            .SelectMany(
                row => row.Orders.DefaultIfEmpty(),
                (row, order) => $"{row.Name}/{order?.Product ?? "-"}")
            .OrderBy(text => text, StringComparer.Ordinal)
            .ToList();
    }
}
