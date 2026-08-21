// i2_interview_drills / ex6 - teach a HashSet what "the same" means. Time-box: 15 minutes.
// See lessons/i2_interview_drills/README.md, "Exercise 6".

namespace CSharpDojo.I2_InterviewDrills;

/// <summary>
/// Two contacts are the same person when their email addresses match, ignoring
/// case and surrounding whitespace. Names are irrelevant.
/// </summary>
public sealed class EmailComparer : IEqualityComparer<Contact>
{
    public bool Equals(Contact? x, Contact? y)
    {
        throw new NotImplementedException("ex6: Equals is not implemented yet - edit this file.");
    }

    public int GetHashCode(Contact obj)
    {
        throw new NotImplementedException("ex6: GetHashCode is not implemented yet - edit this file.");
    }
}

public static class Contacts
{
    /// <summary>
    /// How many distinct PEOPLE are in the list, using the comparer above.
    /// </summary>
    public static int DistinctPeople(IEnumerable<Contact> contacts)
    {
        throw new NotImplementedException("ex6: DistinctPeople is not implemented yet - edit this file.");
    }
}
