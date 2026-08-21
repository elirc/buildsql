// 10_linq_1 / ex4 - Skip and Take: LIMIT and OFFSET, with the same caveat.
// See lessons/10_linq_1/README.md, "Exercise 4".

namespace CSharpDojo.L10_Linq1;

public static class Paging
{
    /// <summary>
    /// One page of order ids, ordered by id, with pages numbered from 1.
    /// A page past the end is empty rather than an error.
    /// </summary>
    public static List<int> PageOfIds(IEnumerable<Order> orders, int pageNumber, int pageSize)
    {
        return orders
            .OrderBy(order => order.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(order => order.Id)
            .ToList();
    }

    /// <summary>
    /// The ids of the <paramref name="count"/> biggest orders, largest first,
    /// ties broken by customer name A-Z.
    /// </summary>
    public static List<int> TopIds(IEnumerable<Order> orders, int count)
    {
        return orders
            .OrderByDescending(order => order.Amount)
            .ThenBy(order => order.Customer)
            .Take(count)
            .Select(order => order.Id)
            .ToList();
    }
}
