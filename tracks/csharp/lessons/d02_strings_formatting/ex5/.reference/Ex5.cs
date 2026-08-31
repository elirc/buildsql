// d02_strings_formatting / ex5 - which "equal" did you mean?
// See lessons/d02_strings_formatting/README.md, "Exercise 5".

namespace CSharpDojo.D02_StringsFormatting;

public static class Names
{
    /// <summary>
    /// Two names are the same when they match ignoring surrounding whitespace
    /// and ignoring case, compared ORDINALLY. Two nulls are the same; one null
    /// is not.
    /// </summary>
    public static bool SameName(string? a, string? b)
    {
        if (a is null || b is null)
        {
            return a is null && b is null;
        }

        return string.Equals(a.Trim(), b.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// A key that sorts and groups consistently on every machine: trimmed and
    /// upper-cased with the invariant culture.
    /// </summary>
    public static string SortKey(string name)
    {
        return name.Trim().ToUpperInvariant();
    }

    /// <summary>Does the text begin with the prefix, ignoring case, ordinally?</summary>
    public static bool StartsWithIgnoringCase(string text, string prefix)
    {
        return text.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
    }
}
