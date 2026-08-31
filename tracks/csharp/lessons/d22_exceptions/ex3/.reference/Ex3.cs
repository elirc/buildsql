// d22_exceptions / ex3 - a catch that can say no.
// See lessons/d22_exceptions/README.md, "Exercise 3".

namespace CSharpDojo.D22_Exceptions;

public class HttpLikeException : Exception
{
    public HttpLikeException(int status)
        : base($"status {status}")
    {
        Status = status;
    }

    public int Status { get; }
}

public static class Filters
{
    /// <summary>
    /// Returns what the call returned, or "handled:503" when it threw a
    /// HttpLikeException with a status of 500 or more. A status below 500
    /// escapes, and so does any other exception type. The decision must be
    /// made by an exception FILTER, and the filter must add
    /// "filter:&lt;status&gt;" to the log as it decides.
    /// </summary>
    public static string Classify(Func<string> call, List<string> log)
    {
        try
        {
            return call();
        }
        catch (HttpLikeException ex) when (Retryable(ex, log))
        {
            return $"handled:{ex.Status}";
        }
    }

    private static bool Retryable(HttpLikeException exception, List<string> log)
    {
        log.Add($"filter:{exception.Status}");
        return exception.Status >= 500;
    }
}
