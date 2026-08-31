// d02_strings_formatting / ex2 - format specifiers, not string surgery.
// See lessons/d02_strings_formatting/README.md, "Exercise 2".

using System.Globalization;

namespace CSharpDojo.D02_StringsFormatting;

public static class Formats
{
    /// <summary>
    /// An amount with thousands separators and exactly two decimals, in the
    /// INVARIANT culture: 1234.5 becomes "1,234.50".
    /// </summary>
    public static string Money(decimal amount)
    {
        return amount.ToString("N2", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// A ratio as a percentage with exactly one decimal and a trailing "%",
    /// invariant culture: 0.1234 becomes "12.3%".
    /// </summary>
    public static string Percent(double ratio)
    {
        return (ratio * 100).ToString("0.0", CultureInfo.InvariantCulture) + "%";
    }

    /// <summary>
    /// A value as "0x" plus at least four UPPER-case hex digits: 255 becomes
    /// "0x00FF".
    /// </summary>
    public static string Hex(int value)
    {
        return "0x" + value.ToString("X4", CultureInfo.InvariantCulture);
    }
}
