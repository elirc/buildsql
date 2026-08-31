// d05_classes_construction / ex4 - a class that owns a collection.
// See lessons/d05_classes_construction/README.md, "Exercise 4".

namespace CSharpDojo.D05_ClassesConstruction;

public class Playlist
{
    private readonly List<string> _tracks = new List<string>();

    /// <summary>
    /// Start from the given tracks, COPIED - a later change to the caller's
    /// collection must not change this playlist.
    /// </summary>
    public Playlist(IEnumerable<string> tracks)
    {
        throw new NotImplementedException("ex4: the Playlist constructor is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The tracks in order, as a view the caller cannot add to or remove from.
    /// </summary>
    public IReadOnlyList<string> Tracks =>
        throw new NotImplementedException("ex4: Tracks is not implemented yet - edit this file.");

    /// <summary>Append a track to the end.</summary>
    public void Add(string track)
    {
        throw new NotImplementedException("ex4: Add is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Remove the first occurrence of the track. True when something was
    /// removed, false when the track was not there.
    /// </summary>
    public bool Remove(string track)
    {
        throw new NotImplementedException("ex4: Remove is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Swap the first occurrence of the track with the one before it. False
    /// when the track is missing or already first.
    /// </summary>
    public bool MoveUp(string track)
    {
        throw new NotImplementedException("ex4: MoveUp is not implemented yet - edit this file.");
    }
}
