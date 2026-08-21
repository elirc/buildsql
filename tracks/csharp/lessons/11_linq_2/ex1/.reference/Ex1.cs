// 11_linq_2 / ex1 - GroupBy: the GROUP BY you already know.
// See lessons/11_linq_2/README.md, "Exercise 1".

namespace CSharpDojo.L11_Linq2;

public static class Grouped
{
    /// <summary>
    /// "category: total" for each category, biggest total first, ties broken by
    /// category name A-Z.
    /// </summary>
    public static List<string> TotalByCategory(IEnumerable<Sale> sales)
    {
        return sales
            .GroupBy(sale => sale.Category)
            .Select(group => new { Category = group.Key, Total = group.Sum(sale => sale.Amount) })
            .OrderByDescending(row => row.Total)
            .ThenBy(row => row.Category)
            .Select(row => $"{row.Category}: {row.Total}")
            .ToList();
    }

    /// <summary>How many sales each category had, keyed by category.</summary>
    public static Dictionary<string, int> CountByCategory(IEnumerable<Sale> sales)
    {
        return sales
            .GroupBy(sale => sale.Category)
            .ToDictionary(group => group.Key, group => group.Count());
    }
}
