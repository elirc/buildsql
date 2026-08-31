// d19_linq_grouping / ex2 - aggregating inside each group.
// See lessons/d19_linq_grouping/README.md, "Exercise 2".

namespace CSharpDojo.D19_LinqGrouping;

// The gate builds these. Written for you.
public record Sale(string Region, string Product, int Units);

public static class Totals
{
    /// <summary>
    /// "region=total" for each region, ordered by total descending with ties
    /// broken by region name (ordinal, ascending).
    /// </summary>
    public static List<string> UnitsByRegion(IEnumerable<Sale> sales)
    {
        return sales
            .GroupBy(sale => sale.Region)
            .Select(group => new { Region = group.Key, Total = group.Sum(sale => sale.Units) })
            .OrderByDescending(row => row.Total)
            .ThenBy(row => row.Region, StringComparer.Ordinal)
            .Select(row => $"{row.Region}={row.Total}")
            .ToList();
    }

    /// <summary>
    /// For each region, the product of the single sale with the most units.
    /// Ties are broken by product name (ordinal, ascending).
    /// </summary>
    public static Dictionary<string, string> BestSellerByRegion(IEnumerable<Sale> sales)
    {
        return sales
            .GroupBy(sale => sale.Region)
            .ToDictionary(
                group => group.Key,
                group => group
                    .OrderByDescending(sale => sale.Units)
                    .ThenBy(sale => sale.Product, StringComparer.Ordinal)
                    .First()
                    .Product);
    }

    /// <summary>For each region, the largest number of units on any one sale.</summary>
    public static Dictionary<string, int> PeakSaleByRegion(IEnumerable<Sale> sales)
    {
        return sales
            .GroupBy(sale => sale.Region)
            .ToDictionary(group => group.Key, group => group.Max(sale => sale.Units));
    }
}
