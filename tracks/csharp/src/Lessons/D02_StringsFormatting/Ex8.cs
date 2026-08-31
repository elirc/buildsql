// d02_strings_formatting / ex8 - the URL slug.
// See lessons/d02_strings_formatting/README.md, "Exercise 8".

namespace CSharpDojo.D02_StringsFormatting;

public static class Slug
{
    /// <summary>
    /// Turn a title into a URL slug:
    /// - ASCII letters and digits are kept, lower-cased with the invariant culture;
    /// - every other character is a separator;
    /// - a run of separators collapses to a single "-";
    /// - no leading or trailing "-".
    /// A title with nothing usable in it gives "".
    /// </summary>
    public static string From(string title)
    {
        throw new NotImplementedException("ex8: From is not implemented yet - edit this file.");
    }
}
