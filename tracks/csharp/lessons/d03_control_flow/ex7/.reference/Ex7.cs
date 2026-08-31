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
        int total = 0;
        int seen = 0;

        for (int i = input.Length - 1; i >= 0; i--)
        {
            char c = input[i];
            if (c == ' ' || c == '-')
            {
                continue;
            }

            if (!char.IsAsciiDigit(c))
            {
                return false;
            }

            int digit = c - '0';
            if (seen % 2 == 1)
            {
                digit *= 2;
                if (digit > 9)
                {
                    digit -= 9;
                }
            }

            total += digit;
            seen++;
        }

        return seen >= 2 && total % 10 == 0;
    }
}
