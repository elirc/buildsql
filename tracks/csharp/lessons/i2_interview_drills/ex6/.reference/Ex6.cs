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
        if (x is null || y is null)
        {
            return ReferenceEquals(x, y);
        }

        return string.Equals(Key(x), Key(y), StringComparison.OrdinalIgnoreCase);
    }

    public int GetHashCode(Contact obj)
    {
        return StringComparer.OrdinalIgnoreCase.GetHashCode(Key(obj));
    }

    private static string Key(Contact contact) => contact.Email.Trim();
}

public static class Contacts
{
    /// <summary>
    /// How many distinct PEOPLE are in the list, using the comparer above.
    /// </summary>
    public static int DistinctPeople(IEnumerable<Contact> contacts)
    {
        return new HashSet<Contact>(contacts, new EmailComparer()).Count;
    }
}
