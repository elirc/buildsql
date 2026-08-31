// d18_linq_filtering / ex7 - several filters, an ordering and a limit.
// See lessons/d18_linq_filtering/README.md, "Exercise 7".

namespace CSharpDojo.D18_LinqFiltering;

// The gate builds these. Written for you.
public record Sale(string Region, string Product, int Units, decimal UnitPrice);

public static class Reports
{
    /// <summary>
    /// The names of the highest-earning sales that are in one of the allowed
    /// regions and earned at least minRevenue, where revenue is Units times
    /// UnitPrice. Ordered by revenue descending, ties broken by Product with
    /// an ordinal comparison, then cut to at most count entries.
    /// </summary>
    public static List<string> TopProducts(
        IEnumerable<Sale> sales, HashSet<string> allowedRegions, decimal minRevenue, int count)
    {
        return sales
            .Where(sale => allowedRegions.Contains(sale.Region))
            .Where(sale => sale.Units * sale.UnitPrice >= minRevenue)
            .OrderByDescending(sale => sale.Units * sale.UnitPrice)
            .ThenBy(sale => sale.Product, StringComparer.Ordinal)
            .Take(count)
            .Select(sale => sale.Product)
            .ToList();
    }
}
