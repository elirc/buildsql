// d02_strings_formatting / ex7 - greedy word wrap.
// See lessons/d02_strings_formatting/README.md, "Exercise 7".

using System.Text;

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
        List<string> lines = new List<string>();
        string[] words = text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
        StringBuilder current = new StringBuilder();

        foreach (string word in words)
        {
            if (current.Length == 0)
            {
                current.Append(word);
            }
            else if (current.Length + 1 + word.Length <= width)
            {
                current.Append(' ').Append(word);
            }
            else
            {
                lines.Add(current.ToString());
                current.Clear().Append(word);
            }
        }

        if (current.Length > 0)
        {
            lines.Add(current.ToString());
        }

        return lines;
    }
}
