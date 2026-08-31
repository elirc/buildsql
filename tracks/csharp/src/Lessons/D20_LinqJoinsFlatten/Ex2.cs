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
        throw new NotImplementedException("ex2: CustomerBasket is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The names of the customers who have no orders at all, ordered by name
    /// (ordinal).
    /// </summary>
    public static List<string> Idle(IEnumerable<Customer> customers, IEnumerable<Order> orders)
    {
        throw new NotImplementedException("ex2: Idle is not implemented yet - edit this file.");
    }

    /// <summary>
    /// One row per customer-and-order pair, plus one row per customer with no
    /// orders: "ada/book" or "zoe/-". Ordered by name (ordinal), then by
    /// product (ordinal). This is the flattened left join.
    /// </summary>
    public static List<string> EveryRow(IEnumerable<Customer> customers, IEnumerable<Order> orders)
    {
        throw new NotImplementedException("ex2: EveryRow is not implemented yet - edit this file.");
    }
}
