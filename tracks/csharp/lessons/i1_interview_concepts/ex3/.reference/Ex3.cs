// i1_interview_concepts / ex3 - fix the multiple enumeration.
// See lessons/i1_interview_concepts/README.md, "Exercise 3".

namespace CSharpDojo.I1_InterviewConcepts;

public static class Sequences
{
    /// <summary>
    /// "3 items, total 60" - or "no items" for an empty sequence.
    ///
    /// The obvious implementation walks the sequence three times (Any, Count,
    /// Sum). The source might be a database query or a stream: read it ONCE.
    /// </summary>
    public static string Summarise(IEnumerable<int> numbers)
    {
        int count = 0;
        int total = 0;
        foreach (int number in numbers)
        {
            count++;
            total += number;
        }

        return count == 0 ? "no items" : $"{count} items, total {total}";
    }
}
