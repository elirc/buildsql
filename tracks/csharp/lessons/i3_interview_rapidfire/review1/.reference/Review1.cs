// i3_interview_rapidfire / review1 - three one-liners, no notes. 3 minutes.
// See lessons/i3_interview_rapidfire/README.md, "Review".

namespace CSharpDojo.I3_InterviewRapidfire;

public static class Cold
{
    /// <summary>What does Equals say about these two? Ask it and report.</summary>
    public static bool EqualsSays(object a, object b)
    {
        return a.Equals(b);
    }

    /// <summary>Trim the text and hand back the result.</summary>
    public static string Trimmed(string text)
    {
        return text.Trim();
    }

    /// <summary>
    /// Box the number 1 into an object, set the original variable to 9, then
    /// unbox the box and return what is in it.
    /// </summary>
    public static int BoxedThenChanged()
    {
        int number = 1;
        object boxed = number;
        number = 9;
        return (int)boxed;
    }
}
