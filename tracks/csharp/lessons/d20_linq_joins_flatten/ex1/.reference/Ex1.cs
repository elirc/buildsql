// d20_linq_joins_flatten / ex1 - the inner join.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 1".

namespace CSharpDojo.D20_LinqJoinsFlatten;

// The gate builds these. Written for you.
public record Customer(int Id, string Name);

public record Order(int Id, int CustomerId, string Product);

public static class Joins
{
    /// <summary>
    /// "ada:book" for every order that has a matching customer, in the order
    /// the ORDERS arrive. An order whose customer is missing simply is not
    /// there.
    /// </summary>
    public static List<string> CustomerAndProduct(
        IEnumerable<Customer> customers, IEnumerable<Order> orders)
    {
        return orders
            .Join(
                customers,
                order => order.CustomerId,
                customer => customer.Id,
                (order, customer) => $"{customer.Name}:{order.Product}")
            .ToList();
    }

    /// <summary>
    /// The products bought by one named customer, in order. Empty when that
    /// name is unknown.
    /// </summary>
    public static List<string> ProductsFor(
        IEnumerable<Customer> customers, IEnumerable<Order> orders, string name)
    {
        return orders
            .Join(
                customers.Where(customer => customer.Name == name),
                order => order.CustomerId,
                customer => customer.Id,
                (order, customer) => order.Product)
            .ToList();
    }
}
