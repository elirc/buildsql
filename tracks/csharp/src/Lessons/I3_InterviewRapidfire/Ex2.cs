// i3_interview_rapidfire / ex2 - the dictionary key contract, cold. 5 minutes.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 2".

namespace CSharpDojo.I3_InterviewRapidfire;

/// <summary>
/// A grid position. Two coordinates with the same X and Y are the same
/// position - which a plain class does not know until you tell it.
/// </summary>
public class Coordinate
{
    public Coordinate(int x, int y)
    {
        X = x;
        Y = y;
    }

    public int X { get; }

    public int Y { get; }

    public override bool Equals(object? obj)
    {
        throw new NotImplementedException("ex2: Equals is not implemented yet - edit this file.");
    }

    public override int GetHashCode()
    {
        throw new NotImplementedException("ex2: GetHashCode is not implemented yet - edit this file.");
    }
}

public static class Grid
{
    /// <summary>How many DISTINCT positions are in the list.</summary>
    public static int DistinctCount(IEnumerable<Coordinate> points)
    {
        throw new NotImplementedException("ex2: DistinctCount is not implemented yet - edit this file.");
    }
}
