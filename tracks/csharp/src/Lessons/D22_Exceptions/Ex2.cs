// d22_exceptions / ex2 - an exception of your own, with the cause attached.
// See lessons/d22_exceptions/README.md, "Exercise 2".

namespace CSharpDojo.D22_Exceptions;

public class ImportException : Exception
{
    public ImportException(string message, int line, Exception inner)
        : base(message, inner)
    {
        Line = line;
    }

    /// <summary>The 1-based line number that could not be read.</summary>
    public int Line { get; }
}

public static class Importer
{
    /// <summary>
    /// Adds up the lines, each of which should be an integer. A line that is
    /// not throws an ImportException whose message is "bad line 2", whose Line
    /// is that 1-based number, and whose InnerException is the FormatException
    /// that int.Parse produced.
    /// </summary>
    public static int SumLines(IEnumerable<string> lines)
    {
        throw new NotImplementedException("ex2: SumLines is not implemented yet - edit this file.");
    }
}
