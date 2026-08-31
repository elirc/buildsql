// d22_exceptions / ex1 - try, catch, finally, in that order.
// See lessons/d22_exceptions/README.md, "Exercise 1".

namespace CSharpDojo.D22_Exceptions;

public static class Runner
{
    /// <summary>
    /// Runs the action. Returns "ok" when it completes and
    /// "caught:&lt;message&gt;" when it throws an InvalidOperationException.
    /// Any other exception escapes. Either way "cleanup" is the LAST thing
    /// added to the log - including on the way out of an escaping exception.
    /// </summary>
    public static string Attempt(Action action, List<string> log)
    {
        throw new NotImplementedException("ex1: Attempt is not implemented yet - edit this file.");
    }
}
