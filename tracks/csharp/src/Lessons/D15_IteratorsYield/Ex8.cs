// d15_iterators_yield / ex8 - when does the body actually run?
// See lessons/d15_iterators_yield/README.md, "Exercise 8".

namespace CSharpDojo.D15_IteratorsYield;

public static class Tracing
{
    /// <summary>
    /// Yields 1 then 2, writing a diary as it goes: "start" before the first
    /// yield, "middle" between the two, "end" after the last. The gate drives
    /// the enumerator by hand and checks WHEN each entry appears - nothing may
    /// be logged before the first MoveNext.
    /// </summary>
    public static IEnumerable<int> Steps(List<string> log)
    {
        throw new NotImplementedException("ex8: Steps is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Yields 1*1, 2*2, ... count*count, logging "computing n" JUST BEFORE
    /// yielding n's square - so a caller that takes only two squares causes
    /// only two log entries.
    /// </summary>
    public static IEnumerable<int> Squares(List<string> log, int count)
    {
        throw new NotImplementedException("ex8: Squares is not implemented yet - edit this file.");
    }
}
