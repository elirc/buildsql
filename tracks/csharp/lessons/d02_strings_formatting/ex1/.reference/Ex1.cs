// d02_strings_formatting / ex1 - fitting text into a fixed column.
// See lessons/d02_strings_formatting/README.md, "Exercise 1".

namespace CSharpDojo.D02_StringsFormatting;

public static class Labels
{
    /// <summary>
    /// Make text exactly <paramref name="width"/> characters wide: pad on the
    /// right with spaces when it is short, and when it is too long keep the
    /// first width - 3 characters and append "...".
    /// A width below 4 leaves no room for that, so it throws
    /// ArgumentOutOfRangeException.
    /// </summary>
    public static string Fit(string text, int width)
    {
        if (width < 4)
        {
            throw new ArgumentOutOfRangeException(nameof(width), "A field narrower than 4 cannot hold an ellipsis.");
        }

        if (text.Length <= width)
        {
            return text.PadRight(width);
        }

        return text.Substring(0, width - 3) + "...";
    }

    /// <summary>
    /// Centre text in a field of <paramref name="width"/> characters, giving
    /// any odd space to the RIGHT. Text at least as long as the field comes
    /// back unchanged.
    /// </summary>
    public static string Center(string text, int width)
    {
        if (text.Length >= width)
        {
            return text;
        }

        int padding = width - text.Length;
        int left = padding / 2;
        return new string(' ', left) + text + new string(' ', padding - left);
    }
}
