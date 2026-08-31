// d21_deferred_execution / ex3 - what the lambda captured.
// See lessons/d21_deferred_execution/README.md, "Exercise 3".

namespace CSharpDojo.D21_DeferredExecution;

// The gate mutates this between enumerations. Written for you.
public class Threshold
{
    public int Value { get; set; }
}

public static class Captures
{
    /// <summary>
    /// A query that reads the threshold's CURRENT value every time it runs, so
    /// changing the object between two enumerations changes the answer.
    /// </summary>
    public static IEnumerable<int> Above(IEnumerable<int> numbers, Threshold threshold)
    {
        throw new NotImplementedException("ex3: Above is not implemented yet - edit this file.");
    }

    /// <summary>
    /// A query whose threshold was fixed when this method was called, so later
    /// changes to the object cannot reach it.
    /// </summary>
    public static IEnumerable<int> AboveFixed(IEnumerable<int> numbers, Threshold threshold)
    {
        throw new NotImplementedException("ex3: AboveFixed is not implemented yet - edit this file.");
    }
}
