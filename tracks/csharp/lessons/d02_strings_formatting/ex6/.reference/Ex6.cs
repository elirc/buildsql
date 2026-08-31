// d02_strings_formatting / ex6 - a tiny template engine.
// See lessons/d02_strings_formatting/README.md, "Exercise 6".

using System.Text;

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
        StringBuilder output = new StringBuilder(template.Length);
        int index = 0;

        while (index < template.Length)
        {
            char current = template[index];
            if (current != '{')
            {
                output.Append(current);
                index++;
                continue;
            }

            int close = template.IndexOf('}', index + 1);
            if (close < 0)
            {
                output.Append(template, index, template.Length - index);
                break;
            }

            string key = template.Substring(index + 1, close - index - 1);
            if (values.TryGetValue(key, out string? replacement))
            {
                output.Append(replacement);
            }
            else
            {
                output.Append(template, index, close - index + 1);
            }

            index = close + 1;
        }

        return output.ToString();
    }
}
