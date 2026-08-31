// d21_deferred_execution / ex1 - a query is not an answer.
// See lessons/d21_deferred_execution/README.md, "Exercise 1".

namespace CSharpDojo.D21_DeferredExecution;

public static class Deferred
{
    /// <summary>
    /// The query itself, not its result: nothing is read from the list until
    /// somebody enumerates what comes back, so a later change to the list is
    /// visible.
    /// </summary>
    public static IEnumerable<int> BigOnes(List<int> numbers, int min)
    {
        throw new NotImplementedException("ex1: BigOnes is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The answer, taken now: later changes to the list cannot affect it.
    /// </summary>
    public static List<int> BigOnesNow(List<int> numbers, int min)
    {
        throw new NotImplementedException("ex1: BigOnesNow is not implemented yet - edit this file.");
    }
}
