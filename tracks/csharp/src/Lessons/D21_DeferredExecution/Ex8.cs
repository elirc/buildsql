// d21_deferred_execution / ex8 - three answers, one reading.
// See lessons/d21_deferred_execution/README.md, "Exercise 8".

namespace CSharpDojo.D21_DeferredExecution;

// The gate reads these. Written for you.
public record LineReport(int Count, string Longest, List<string> Words);

public static class OnePass
{
    /// <summary>
    /// Reads the lines EXACTLY once and reports how many there were, the
    /// longest one (the first of any tie), and every distinct whitespace
    /// separated word in the order it was first seen. Throws
    /// InvalidOperationException when there are no lines at all.
    /// </summary>
    public static LineReport Analyse(IEnumerable<string> lines)
    {
        throw new NotImplementedException("ex8: Analyse is not implemented yet - edit this file.");
    }
}
