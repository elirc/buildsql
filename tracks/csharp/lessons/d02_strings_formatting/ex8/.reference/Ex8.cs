// d02_strings_formatting / ex8 - the URL slug.
// See lessons/d02_strings_formatting/README.md, "Exercise 8".

using System.Text;

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
        StringBuilder slug = new StringBuilder(title.Length);
        bool pendingSeparator = false;

        foreach (char c in title)
        {
            bool keep = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
            if (!keep)
            {
                pendingSeparator = slug.Length > 0;
                continue;
            }

            if (pendingSeparator)
            {
                slug.Append('-');
                pendingSeparator = false;
            }

            slug.Append(char.ToLowerInvariant(c));
        }

        return slug.ToString();
    }
}
