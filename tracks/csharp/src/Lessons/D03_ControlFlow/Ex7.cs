// d03_control_flow / ex7 - the Luhn check digit.
// See lessons/d03_control_flow/README.md, "Exercise 7".

namespace CSharpDojo.D03_ControlFlow;

public static class Checksum
{
    /// <summary>
    /// Does this string pass the Luhn check?
    ///
    /// Spaces and hyphens are ignored. Any other non-digit makes it invalid,
    /// and so does having fewer than two digits. Otherwise: walking from the
    /// RIGHTMOST digit leftwards, double every second digit (the 2nd, 4th, ...
    /// from the right); a doubled value above 9 has 9 subtracted. The number is
    /// valid when the total of all the digits divides by 10.
    /// </summary>
    public static bool IsValidLuhn(string input)
    {
        throw new NotImplementedException("ex7: IsValidLuhn is not implemented yet - edit this file.");
    }
}
