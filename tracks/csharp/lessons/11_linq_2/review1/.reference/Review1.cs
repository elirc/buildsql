// 11_linq_2 / review1 - grouping, filtering the groups, aggregating them.
// See lessons/11_linq_2/README.md, "Review".

namespace CSharpDojo.L11_Linq2;

public static class Analysis
{
    /// <summary>
    /// The categories with at least <paramref name="minCount"/> sales,
    /// alphabetically. This is HAVING: a filter on the GROUPS, not on the rows.
    /// </summary>
    public static List<string> CategoriesWithAtLeast(IEnumerable<Sale> sales, int minCount)
    {
        return sales
            .GroupBy(sale => sale.Category)
            .Where(group => group.Count() >= minCount)
            .Select(group => group.Key)
            .OrderBy(category => category)
            .ToList();
    }

    /// <summary>
    /// "category: biggest sale" for each category, category A-Z.
    /// </summary>
    public static List<string> MaxByCategory(IEnumerable<Sale> sales)
    {
        return sales
            .GroupBy(sale => sale.Category)
            .OrderBy(group => group.Key)
            .Select(group => $"{group.Key}: {group.Max(sale => sale.Amount)}")
            .ToList();
    }
}
