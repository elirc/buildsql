// d21_deferred_execution / ex5 - which operators can stop early.
// See lessons/d21_deferred_execution/README.md, "Exercise 5".

namespace CSharpDojo.D21_DeferredExecution;

public static class Streaming
{
    /// <summary>
    /// The first <paramref name="count"/> matching numbers, stopping as soon
    /// as it has them - the source must not be read past the last one it
    /// needed.
    /// </summary>
    public static List<int> FirstMatching(
        IEnumerable<int> numbers, Func<int, bool> predicate, int count)
    {
        throw new NotImplementedException("ex5: FirstMatching is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The <paramref name="count"/> largest matching numbers, descending.
    /// This one cannot stop early, and the point is knowing why.
    /// </summary>
    public static List<int> LargestMatching(
        IEnumerable<int> numbers, Func<int, bool> predicate, int count)
    {
        throw new NotImplementedException("ex5: LargestMatching is not implemented yet - edit this file.");
    }
}
