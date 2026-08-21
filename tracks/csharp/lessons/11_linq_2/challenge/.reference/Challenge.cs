// 11_linq_2 / challenge - join, group, aggregate, rank: one report.
// See lessons/11_linq_2/README.md, "Challenge".

namespace CSharpDojo.L11_Linq2;

public static class Revenue
{
    /// <summary>
    /// The <paramref name="count"/> customers who spent the most, as
    /// "bo: 390 | ada: 165 | cy: 120" - biggest first, ties broken by name A-Z.
    /// A customer with no sales does not appear. Nobody at all reports "(none)".
    /// </summary>
    public static string TopCustomers(IEnumerable<Customer> customers, IEnumerable<Sale> sales, int count)
    {
        List<string> lines = sales
            .Join(
                customers,
                sale => sale.CustomerId,
                customer => customer.Id,
                (sale, customer) => new { customer.Name, sale.Amount })
            .GroupBy(row => row.Name)
            .Select(group => new { Name = group.Key, Total = group.Sum(row => row.Amount) })
            .OrderByDescending(row => row.Total)
            .ThenBy(row => row.Name)
            .Take(count)
            .Select(row => $"{row.Name}: {row.Total}")
            .ToList();

        return lines.Count == 0 ? "(none)" : string.Join(" | ", lines);
    }
}
