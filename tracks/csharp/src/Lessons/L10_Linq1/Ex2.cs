// 10_linq_1 / ex2 - the question operators: Any, All, Count, First, Single.
// See lessons/10_linq_1/README.md, "Exercise 2".

namespace CSharpDojo.L10_Linq1;

public static class Questions
{
    /// <summary>
    /// The first order in the given category, or null when there is none.
    /// "First" means first in the sequence as it arrives - no sorting.
    /// </summary>
    public static Order? FirstIn(IEnumerable<Order> orders, string category)
    {
        throw new NotImplementedException("ex2: FirstIn is not implemented yet - edit this file.");
    }

    /// <summary>Is there at least one order above this amount?</summary>
    public static bool AnyOver(IEnumerable<Order> orders, decimal amount)
    {
        throw new NotImplementedException("ex2: AnyOver is not implemented yet - edit this file.");
    }

    /// <summary>Are ALL the orders below this amount? An empty sequence counts as yes.</summary>
    public static bool AllUnder(IEnumerable<Order> orders, decimal amount)
    {
        throw new NotImplementedException("ex2: AllUnder is not implemented yet - edit this file.");
    }

    /// <summary>How many orders are in this category?</summary>
    public static int CountIn(IEnumerable<Order> orders, string category)
    {
        throw new NotImplementedException("ex2: CountIn is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The one order with this id. Ids are unique, so "none" and "more than
    /// one" are both bugs worth an exception rather than a quiet null.
    /// </summary>
    public static Order WithId(IEnumerable<Order> orders, int id)
    {
        throw new NotImplementedException("ex2: WithId is not implemented yet - edit this file.");
    }
}
