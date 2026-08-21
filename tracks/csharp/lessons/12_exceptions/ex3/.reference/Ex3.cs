// 12_exceptions / ex3 - catching the right thing, and only the right thing.
// See lessons/12_exceptions/README.md, "Exercise 3".

namespace CSharpDojo.L12_Exceptions;

public static class Classifier
{
    /// <summary>
    /// Run the work and report what happened:
    ///   nothing thrown                          -> "ok"
    ///   TransientException, StatusCode &gt;= 500 -> "retry"
    ///   any other TransientException            -> "give up"
    ///   anything else                           -> do NOT catch it; let it out.
    /// </summary>
    public static string Attempt(Action work)
    {
        try
        {
            work();
            return "ok";
        }
        catch (TransientException failure) when (failure.StatusCode >= 500)
        {
            return "retry";
        }
        catch (TransientException)
        {
            return "give up";
        }
    }
}
