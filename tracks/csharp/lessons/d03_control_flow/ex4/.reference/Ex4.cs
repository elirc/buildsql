// d03_control_flow / ex4 - a loop that has to look at its neighbour.
// See lessons/d03_control_flow/README.md, "Exercise 4".

using System.Text;

namespace CSharpDojo.D03_ControlFlow;

public static class Runs
{
    /// <summary>
    /// Run-length encode the text: every run of identical characters becomes
    /// the character followed by the run length, ALWAYS - so "aaabbc" is
    /// "a3b2c1". Empty text encodes to "".
    /// </summary>
    public static string Encode(string text)
    {
        StringBuilder encoded = new StringBuilder();
        int index = 0;

        while (index < text.Length)
        {
            char current = text[index];
            int length = 0;
            while (index < text.Length && text[index] == current)
            {
                index++;
                length++;
            }

            encoded.Append(current).Append(length);
        }

        return encoded.ToString();
    }

    /// <summary>
    /// The length of the longest run of identical characters, or 0 for empty
    /// text.
    /// </summary>
    public static int LongestRunLength(string text)
    {
        int longest = 0;
        int current = 0;

        for (int i = 0; i < text.Length; i++)
        {
            current = i > 0 && text[i] == text[i - 1] ? current + 1 : 1;
            if (current > longest)
            {
                longest = current;
            }
        }

        return longest;
    }
}
