// d09_interfaces_contracts / ex2 - the ordering as a separate object.
// See lessons/d09_interfaces_contracts/README.md, "Exercise 2".

namespace CSharpDojo.D09_InterfacesContracts;

public class Track
{
    public Track(string title, int seconds)
    {
        Title = title;
        Seconds = seconds;
    }

    public string Title { get; }

    public int Seconds { get; }

    public override string ToString() => Title;
}

/// <summary>Shortest first; ties broken by title, ordinally.</summary>
public class ByLength : IComparer<Track>
{
    public int Compare(Track? x, Track? y)
    {
        if (x is null || y is null)
        {
            return (x is null ? 0 : 1) - (y is null ? 0 : 1);
        }

        int byLength = x.Seconds.CompareTo(y.Seconds);
        return byLength != 0 ? byLength : string.CompareOrdinal(x.Title, y.Title);
    }
}

/// <summary>Title only, ignoring case, ordinally.</summary>
public class ByTitle : IComparer<Track>
{
    public int Compare(Track? x, Track? y)
    {
        if (x is null || y is null)
        {
            return (x is null ? 0 : 1) - (y is null ? 0 : 1);
        }

        return string.Compare(x.Title, y.Title, StringComparison.OrdinalIgnoreCase);
    }
}

public static class Playlist
{
    /// <summary>
    /// The titles in the order the comparer asks for, joined with ", ".
    /// Sort a COPY - the caller's list must come back untouched.
    /// </summary>
    public static string Ordered(IEnumerable<Track> tracks, IComparer<Track> comparer)
    {
        List<Track> copy = new List<Track>(tracks);
        copy.Sort(comparer);
        return string.Join(", ", copy.Select(track => track.Title));
    }
}
