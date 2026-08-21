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
        throw new NotImplementedException("review1: CategoriesWithAtLeast is not implemented yet - edit this file.");
    }

    /// <summary>
    /// "category: biggest sale" for each category, category A-Z.
    /// </summary>
    public static List<string> MaxByCategory(IEnumerable<Sale> sales)
    {
        throw new NotImplementedException("review1: MaxByCategory is not implemented yet - edit this file.");
    }
}
