// 12_exceptions / ex1 - try, catch, finally, and the order they run in.
// See lessons/12_exceptions/README.md, "Exercise 1".

namespace CSharpDojo.L12_Exceptions;

public static class Basics
{
    /// <summary>
    /// a / b, or <paramref name="fallback"/> when b is 0. Catch the exception
    /// rather than testing b first - this exercise is about the mechanism.
    /// </summary>
    public static int SafeDivide(int a, int b, int fallback)
    {
        throw new NotImplementedException("ex1: SafeDivide is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Add "try" first, then throw an InvalidOperationException when
    /// <paramref name="shouldThrow"/> is set, then add "after" on the path
    /// where nothing was thrown. Catch it and add "catch", and add "finally"
    /// in a finally block. Return the log so the gate can read the order.
    /// </summary>
    public static List<string> Trace(bool shouldThrow)
    {
        throw new NotImplementedException("ex1: Trace is not implemented yet - edit this file.");
    }
}
