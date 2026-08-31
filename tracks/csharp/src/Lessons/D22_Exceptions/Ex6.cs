// d22_exceptions / ex6 - catching the right thing, in the right order.
// See lessons/d22_exceptions/README.md, "Exercise 6".

namespace CSharpDojo.D22_Exceptions;

public static class Sorting
{
    /// <summary>
    /// Runs the action and reports which kind of failure it saw:
    /// "null-arg" for ArgumentNullException, "arg" for any other
    /// ArgumentException, "format" for FormatException, "other" for anything
    /// else, and "ok" when nothing was thrown.
    /// </summary>
    public static string Kind(Action action)
    {
        throw new NotImplementedException("ex6: Kind is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The messages of every leaf exception inside an AggregateException,
    /// however deeply the aggregates are nested, comma-joined in order.
    /// </summary>
    public static string Leaves(AggregateException exception)
    {
        throw new NotImplementedException("ex6: Leaves is not implemented yet - edit this file.");
    }
}
