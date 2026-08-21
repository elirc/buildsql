// 03_classes_objects / review1 - instance state, static state, one invariant.
// See lessons/03_classes_objects/README.md, "Review".

namespace CSharpDojo.L03_ClassesObjects;

public class Scoreboard
{
    /// <summary>How many Scoreboards exist, since the last Reset.</summary>
    public static int Created { get; private set; }

    public Scoreboard(string team)
    {
        throw new NotImplementedException("review1: the Scoreboard constructor is not implemented yet - edit this file.");
    }

    public string Team { get; } = "";

    /// <summary>Readable by anyone, changed only through Add.</summary>
    public int Points { get; private set; }

    /// <summary>Award points. A negative award is an ArgumentOutOfRangeException.</summary>
    public void Add(int points)
    {
        throw new NotImplementedException("review1: Add is not implemented yet - edit this file.");
    }

    public static void Reset()
    {
        throw new NotImplementedException("review1: Reset is not implemented yet - edit this file.");
    }
}
