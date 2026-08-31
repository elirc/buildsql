// d21_deferred_execution / ex4 - a sequence you may only read once.
// See lessons/d21_deferred_execution/README.md, "Exercise 4".

namespace CSharpDojo.D21_DeferredExecution;

public static class Safety
{
    /// <summary>
    /// How many items there are, the first one and the last one - from a
    /// source that permits exactly one enumeration. Throws
    /// InvalidOperationException when the source is empty.
    /// </summary>
    public static (int Count, int First, int Last) Inspect(IEnumerable<int> source)
    {
        throw new NotImplementedException("ex4: Inspect is not implemented yet - edit this file.");
    }
}
