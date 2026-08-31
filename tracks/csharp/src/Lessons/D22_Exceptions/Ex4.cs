// d22_exceptions / ex4 - rethrowing without destroying the evidence.
// See lessons/d22_exceptions/README.md, "Exercise 4".

namespace CSharpDojo.D22_Exceptions;

public static class Rethrow
{
    /// <summary>
    /// Written for you, and deliberately wrong: `throw ex;` starts the stack
    /// trace again from this line, so wherever the exception really came from
    /// is gone.
    /// </summary>
    public static void Losing(Action action, List<string> log)
    {
        try
        {
            action();
        }
        catch (Exception ex)
        {
            log.Add($"seen:{ex.Message}");
            throw ex;
        }
    }

    /// <summary>
    /// The same logging, but the original stack trace survives.
    /// </summary>
    public static void Keeping(Action action, List<string> log)
    {
        throw new NotImplementedException("ex4: Keeping is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Catches anything and throws an InvalidOperationException with the
    /// message "wrapped" and the original exception as its InnerException.
    /// </summary>
    public static void Wrapping(Action action)
    {
        throw new NotImplementedException("ex4: Wrapping is not implemented yet - edit this file.");
    }
}
