// d21_deferred_execution / ex8 - three answers, one reading.
// See lessons/d21_deferred_execution/README.md, "Exercise 8".

namespace CSharpDojo.D21_DeferredExecution;

// The gate reads these. Written for you.
public record LineReport(int Count, string Longest, List<string> Words);

public static class OnePass
{
    /// <summary>
    /// Reads the lines EXACTLY once and reports how many there were, the
    /// longest one (the first of any tie), and every distinct whitespace
    /// separated word in the order it was first seen. Throws
    /// InvalidOperationException when there are no lines at all.
    /// </summary>
    public static LineReport Analyse(IEnumerable<string> lines)
    {
        int count = 0;
        string? longest = null;
        List<string> words = new List<string>();
        HashSet<string> seen = new HashSet<string>();

        foreach (string line in lines)
        {
            count++;

            if (longest is null || line.Length > longest.Length)
            {
                longest = line;
            }

            foreach (string word in line.Split(
                (char[]?)null, StringSplitOptions.RemoveEmptyEntries))
            {
                if (seen.Add(word))
                {
                    words.Add(word);
                }
            }
        }

        if (longest is null)
        {
            throw new InvalidOperationException("cannot analyse an empty sequence of lines");
        }

        return new LineReport(count, longest, words);
    }
}
