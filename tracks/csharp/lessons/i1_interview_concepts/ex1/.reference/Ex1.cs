// i1_interview_concepts / ex1 - == versus Equals, cold.
// See lessons/i1_interview_concepts/README.md, "Exercise 1".

namespace CSharpDojo.I1_InterviewConcepts;

public static class Equality
{
    /// <summary>Are these two references pointing at the very same object?</summary>
    public static bool SameObject(object a, object b)
    {
        return ReferenceEquals(a, b);
    }

    /// <summary>
    /// What does == say about two STRINGS? Use the operator and report what it
    /// says - do not "fix" the answer.
    /// </summary>
    public static bool StringsEqual(string a, string b)
    {
        return a == b;
    }

    /// <summary>
    /// What does == say about two values typed as OBJECT? Again: use the
    /// operator, report the answer.
    /// </summary>
    public static bool ObjectsEqual(object a, object b)
    {
        return a == b;
    }

    /// <summary>And what does Equals say about the same two objects?</summary>
    public static bool ObjectsDotEquals(object a, object b)
    {
        return a.Equals(b);
    }
}
