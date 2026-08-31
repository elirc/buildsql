// d02_strings_formatting / ex4 - building strings without building garbage.
// See lessons/d02_strings_formatting/README.md, "Exercise 4".

using System.Text;

namespace CSharpDojo.D02_StringsFormatting;

public static class Builder
{
    /// <summary>
    /// The word repeated <paramref name="times"/> times with the separator
    /// BETWEEN copies only. Zero or fewer times gives "".
    /// Build it with a StringBuilder.
    /// </summary>
    public static string Repeat(string word, int times, string separator)
    {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < times; i++)
        {
            if (i > 0)
            {
                builder.Append(separator);
            }

            builder.Append(word);
        }

        return builder.ToString();
    }

    /// <summary>The characters of the text in reverse order.</summary>
    public static string Reverse(string text)
    {
        StringBuilder builder = new StringBuilder(text.Length);
        for (int i = text.Length - 1; i >= 0; i--)
        {
            builder.Append(text[i]);
        }

        return builder.ToString();
    }
}
