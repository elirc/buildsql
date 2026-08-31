// d13_lists_dictionaries / ex7 - a dictionary inside a dictionary.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 7".

namespace CSharpDojo.D13_ListsDictionaries;

public static class Gradebook
{
    /// <summary>
    /// Records a score for a student in a subject. A student's inner dictionary
    /// is created the first time they appear; recording the same subject twice
    /// keeps the LATEST score.
    /// </summary>
    public static void Record(Dictionary<string, Dictionary<string, int>> book, string student, string subject, int score)
    {
        throw new NotImplementedException("ex7: Record is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The score, or null when the student is unknown or has no score in that
    /// subject. Two lookups, either can miss, neither may throw.
    /// </summary>
    public static int? ScoreOf(Dictionary<string, Dictionary<string, int>> book, string student, string subject)
    {
        throw new NotImplementedException("ex7: ScoreOf is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The average score in a subject, over exactly the students who have one.
    /// When nobody has a score, throws InvalidOperationException (which is what
    /// Average over an empty sequence does).
    /// </summary>
    public static double SubjectAverage(Dictionary<string, Dictionary<string, int>> book, string subject)
    {
        throw new NotImplementedException("ex7: SubjectAverage is not implemented yet - edit this file.");
    }
}
