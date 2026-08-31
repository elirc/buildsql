// d02_strings_formatting / ex6 - a tiny template engine.
// See lessons/d02_strings_formatting/README.md, "Exercise 6".

namespace CSharpDojo.D02_StringsFormatting;

public static class Template
{
    /// <summary>
    /// Replace every "{key}" in the template with values[key].
    /// A key that is not in the dictionary is left exactly as it was, braces
    /// and all. A "{" with no matching "}" is ordinary text. Braces do not
    /// nest, and everything outside them is copied through untouched.
    /// </summary>
    public static string Render(string template, IReadOnlyDictionary<string, string> values)
    {
        throw new NotImplementedException("ex6: Render is not implemented yet - edit this file.");
    }
}
