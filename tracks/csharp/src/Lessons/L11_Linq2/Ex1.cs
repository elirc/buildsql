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
        throw new NotImplementedException("ex1: TotalByCategory is not implemented yet - edit this file.");
    }

    /// <summary>How many sales each category had, keyed by category.</summary>
    public static Dictionary<string, int> CountByCategory(IEnumerable<Sale> sales)
    {
        throw new NotImplementedException("ex1: CountByCategory is not implemented yet - edit this file.");
    }
}
