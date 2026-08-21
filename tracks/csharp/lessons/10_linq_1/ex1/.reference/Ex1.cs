// 10_linq_1 / ex1 - Where, Select, OrderBy: SELECT ... WHERE ... ORDER BY.
// See lessons/10_linq_1/README.md, "Exercise 1".

namespace CSharpDojo.L10_Linq1;

public static class Queries
{
    /// <summary>
    /// The customer name of every order worth at least <paramref name="minimum"/>,
    /// largest amount first, and ties broken by customer name A-Z.
    /// </summary>
    public static List<string> NamesOfOrdersOver(IEnumerable<Order> orders, decimal minimum)
    {
        return orders
            .Where(order => order.Amount >= minimum)
            .OrderByDescending(order => order.Amount)
            .ThenBy(order => order.Customer)
            .Select(order => order.Customer)
            .ToList();
    }

    /// <summary>
    /// Every order as "customer: amount", ordered by customer A-Z and then by
    /// amount largest first.
    /// </summary>
    public static List<string> SortedLabels(IEnumerable<Order> orders)
    {
        return orders
            .OrderBy(order => order.Customer)
            .ThenByDescending(order => order.Amount)
            .Select(order => $"{order.Customer}: {order.Amount}")
            .ToList();
    }
}
