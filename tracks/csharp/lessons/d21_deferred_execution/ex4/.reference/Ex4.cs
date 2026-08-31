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
        List<int> items = source.ToList();
        if (items.Count == 0)
        {
            throw new InvalidOperationException("cannot inspect an empty sequence");
        }

        return (items.Count, items[0], items[items.Count - 1]);
    }
}
