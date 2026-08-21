// i1_interview_concepts / review1 - references, reassignment, immutability.
// See lessons/i1_interview_concepts/README.md, "Review".

namespace CSharpDojo.I1_InterviewConcepts;

public static class Mixed
{
    /// <summary>
    /// Add 99 to the list you were given. Then point the PARAMETER at a brand
    /// new List and add 1000 to that one. Write both halves - the gate is
    /// asking what the caller sees.
    /// </summary>
    public static void AddThenReassign(List<int> items)
    {
        items.Add(99);
        items = new List<int>();
        items.Add(1000);
    }

    /// <summary>The text in upper case, returned. The caller's string is not yours to change.</summary>
    public static string Shout(string text)
    {
        return text.ToUpperInvariant();
    }

    /// <summary>Are these two strings the same object in memory?</summary>
    public static bool SameInstance(string a, string b)
    {
        return ReferenceEquals(a, b);
    }
}
