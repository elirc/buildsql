// d21_deferred_execution / ex2 - two questions, one pass.
// See lessons/d21_deferred_execution/README.md, "Exercise 2".

namespace CSharpDojo.D21_DeferredExecution;

public static class Passes
{
    /// <summary>
    /// Written for you, and deliberately wasteful: two LINQ calls over the
    /// same sequence walk it twice and run the predicate twice per item.
    /// </summary>
    public static (int Count, int Total) CountAndTotalTwice(
        IEnumerable<int> numbers, Func<int, bool> predicate)
    {
        return (numbers.Count(predicate), numbers.Where(predicate).Sum());
    }

    /// <summary>
    /// The same two numbers, walking the sequence exactly ONCE and calling the
    /// predicate exactly once per item.
    /// </summary>
    public static (int Count, int Total) CountAndTotal(
        IEnumerable<int> numbers, Func<int, bool> predicate)
    {
        throw new NotImplementedException("ex2: CountAndTotal is not implemented yet - edit this file.");
    }
}
