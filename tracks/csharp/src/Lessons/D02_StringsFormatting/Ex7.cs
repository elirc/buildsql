// d02_strings_formatting / ex7 - greedy word wrap.
// See lessons/d02_strings_formatting/README.md, "Exercise 7".

namespace CSharpDojo.D02_StringsFormatting;

public static class Wrap
{
    /// <summary>
    /// Break the text into lines no longer than <paramref name="width"/>,
    /// greedily: keep adding words (separated by one space) while they fit,
    /// then start a new line. Runs of whitespace collapse to one separator, a
    /// word longer than the width gets a line to itself rather than being
    /// broken, and text with no words at all gives an empty list.
    /// </summary>
    public static List<string> Lines(string text, int width)
    {
        throw new NotImplementedException("ex7: Lines is not implemented yet - edit this file.");
    }
}
