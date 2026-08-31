// d21_deferred_execution / ex6 - an expensive selector, called once per item.
// See lessons/d21_deferred_execution/README.md, "Exercise 6".

namespace CSharpDojo.D21_DeferredExecution;

public static class Costs
{
    /// <summary>
    /// Written for you, and deliberately wasteful: one pass to find the
    /// smallest cost and another to find an item that has it, so the cost
    /// function runs twice for every item.
    /// </summary>
    public static string CheapestTwoPass(IEnumerable<string> items, Func<string, int> cost)
    {
        int lowest = items.Min(cost);
        return items.First(item => cost(item) == lowest);
    }

    /// <summary>
    /// The item with the lowest cost, calling the cost function exactly ONCE
    /// per item. The first item wins a tie. Throws InvalidOperationException
    /// when there are no items.
    /// </summary>
    public static string Cheapest(IEnumerable<string> items, Func<string, int> cost)
    {
        throw new NotImplementedException("ex6: Cheapest is not implemented yet - edit this file.");
    }
}
