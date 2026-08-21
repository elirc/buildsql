// 10_linq_1 / review1 - filter, project, distinct, and stay lazy.
// See lessons/10_linq_1/README.md, "Review".

namespace CSharpDojo.L10_Linq1;

public static class Catalogue
{
    /// <summary>
    /// The distinct categories that have at least one order worth
    /// <paramref name="minimum"/> or more, in alphabetical order.
    /// </summary>
    public static List<string> CategoriesOver(IEnumerable<Order> orders, decimal minimum)
    {
        throw new NotImplementedException("review1: CategoriesOver is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Every customer name, as a query that has not run yet. Nothing may touch
    /// the source until the caller enumerates the result.
    /// </summary>
    public static IEnumerable<string> LazyNames(IEnumerable<Order> orders)
    {
        throw new NotImplementedException("review1: LazyNames is not implemented yet - edit this file.");
    }
}
