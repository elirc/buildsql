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
        throw new NotImplementedException("ex1: Fit is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Centre text in a field of <paramref name="width"/> characters, giving
    /// any odd space to the RIGHT. Text at least as long as the field comes
    /// back unchanged.
    /// </summary>
    public static string Center(string text, int width)
    {
        throw new NotImplementedException("ex1: Center is not implemented yet - edit this file.");
    }
}
