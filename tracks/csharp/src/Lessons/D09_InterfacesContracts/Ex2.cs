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
        throw new NotImplementedException("ex2: ByLength.Compare is not implemented yet - edit this file.");
    }
}

/// <summary>Title only, ignoring case, ordinally.</summary>
public class ByTitle : IComparer<Track>
{
    public int Compare(Track? x, Track? y)
    {
        throw new NotImplementedException("ex2: ByTitle.Compare is not implemented yet - edit this file.");
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
        throw new NotImplementedException("ex2: Ordered is not implemented yet - edit this file.");
    }
}
