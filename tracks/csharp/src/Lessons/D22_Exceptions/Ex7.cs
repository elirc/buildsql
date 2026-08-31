// d22_exceptions / ex7 - retry the retryable, and only that.
// See lessons/d22_exceptions/README.md, "Exercise 7".

namespace CSharpDojo.D22_Exceptions;

public class TransientException : Exception
{
    public TransientException(string message)
        : base(message)
    {
    }
}

public static class Retry
{
    /// <summary>
    /// Calls the operation until it succeeds or has been tried
    /// <paramref name="attempts"/> times, adding "attempt:1", "attempt:2" and
    /// so on to the log before each try. Only a TransientException is retried;
    /// anything else escapes at once, with its own type. When the last attempt
    /// also fails, throws an InvalidOperationException whose message is
    /// "gave up after 3 attempts" and whose InnerException is the last
    /// TransientException. An attempts count below 1 is an
    /// ArgumentOutOfRangeException, thrown before anything is tried.
    /// </summary>
    public static T Run<T>(Func<T> operation, int attempts, List<string> log)
    {
        throw new NotImplementedException("ex7: Run is not implemented yet - edit this file.");
    }
}
