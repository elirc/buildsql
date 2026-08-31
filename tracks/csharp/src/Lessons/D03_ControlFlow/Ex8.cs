// d03_control_flow / ex8 - a hand-rolled number scanner.
// See lessons/d03_control_flow/README.md, "Exercise 8".

namespace CSharpDojo.D03_ControlFlow;

public static class Numeric
{
    /// <summary>
    /// Is the WHOLE text a decimal number, judged without calling any Parse
    /// method? The grammar: an optional leading "+" or "-", then digits, then
    /// optionally a "." followed by at least one digit.
    ///
    /// So "12", "-12.5", "+0.5", ".5" and "007" are numbers; "", "-", ".",
    /// "5.", "1.2.3", "1a" and " 1" are not. There must be at least one digit
    /// somewhere, and no character may be left over at the end.
    /// </summary>
    public static bool IsNumber(string text)
    {
        throw new NotImplementedException("ex8: IsNumber is not implemented yet - edit this file.");
    }
}
