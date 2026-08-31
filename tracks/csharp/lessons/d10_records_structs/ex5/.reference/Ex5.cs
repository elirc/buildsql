// d10_records_structs / ex5 - record struct, and the readonly one.
// See lessons/d10_records_structs/README.md, "Exercise 5".

namespace CSharpDojo.D10_RecordsStructs;

/// <summary>A record STRUCT: value semantics, and its members can be reassigned.</summary>
public record struct Tally(int Wins, int Losses);

/// <summary>A READONLY record struct: nothing may be changed after construction.</summary>
public readonly record struct Point(int X, int Y);

public static class Structs
{
    /// <summary>
    /// Add one to the Wins of the tally it was GIVEN and return it. Because the
    /// parameter is a struct, the caller's own tally must be untouched.
    /// </summary>
    public static Tally BumpWins(Tally tally)
    {
        tally.Wins++;
        return tally;
    }

    /// <summary>The point with its X negated, built with a `with` expression.</summary>
    public static Point Mirror(Point point) => point with { X = -point.X };

    /// <summary>
    /// "3-1" - wins, a hyphen, losses. Deconstruct the tally rather than
    /// reading its properties.
    /// </summary>
    public static string Score(Tally tally)
    {
        (int wins, int losses) = tally;
        return $"{wins}-{losses}";
    }
}
