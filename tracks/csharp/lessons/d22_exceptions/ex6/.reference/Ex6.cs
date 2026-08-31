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
        try
        {
            action();
            return "ok";
        }
        catch (ArgumentNullException)
        {
            return "null-arg";
        }
        catch (ArgumentException)
        {
            return "arg";
        }
        catch (FormatException)
        {
            return "format";
        }
        catch (Exception)
        {
            return "other";
        }
    }

    /// <summary>
    /// The messages of every leaf exception inside an AggregateException,
    /// however deeply the aggregates are nested, comma-joined in order.
    /// </summary>
    public static string Leaves(AggregateException exception)
    {
        return string.Join(",", exception.Flatten().InnerExceptions.Select(inner => inner.Message));
    }
}
