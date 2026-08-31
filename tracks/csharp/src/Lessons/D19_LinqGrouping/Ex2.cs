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
        throw new NotImplementedException("ex2: UnitsByRegion is not implemented yet - edit this file.");
    }

    /// <summary>
    /// For each region, the product of the single sale with the most units.
    /// Ties are broken by product name (ordinal, ascending).
    /// </summary>
    public static Dictionary<string, string> BestSellerByRegion(IEnumerable<Sale> sales)
    {
        throw new NotImplementedException("ex2: BestSellerByRegion is not implemented yet - edit this file.");
    }

    /// <summary>For each region, the largest number of units on any one sale.</summary>
    public static Dictionary<string, int> PeakSaleByRegion(IEnumerable<Sale> sales)
    {
        throw new NotImplementedException("ex2: PeakSaleByRegion is not implemented yet - edit this file.");
    }
}
