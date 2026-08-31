// d04_methods_params / ex3 - the Try-pattern with two out parameters.
// See lessons/d04_methods_params/README.md, "Exercise 3".

using System.Globalization;

namespace CSharpDojo.D04_MethodsParams;

public static class Parsing
{
    /// <summary>
    /// Read a range written as "low-high" - for example "3-9". Whitespace
    /// around either number is ignored. Both numbers must be non-negative
    /// whole numbers and low must not be greater than high.
    /// On any failure return false with both out parameters set to 0.
    /// </summary>
    public static bool TryRange(string? text, out int low, out int high)
    {
        low = 0;
        high = 0;
        if (string.IsNullOrWhiteSpace(text))
        {
            return false;
        }

        string[] parts = text.Split('-');
        if (parts.Length != 2)
        {
            return false;
        }

        if (!int.TryParse(parts[0].Trim(), NumberStyles.None, CultureInfo.InvariantCulture, out int start)
            || !int.TryParse(parts[1].Trim(), NumberStyles.None, CultureInfo.InvariantCulture, out int end)
            || start > end)
        {
            return false;
        }

        low = start;
        high = end;
        return true;
    }
}
