// 06_structs_records / challenge - a record struct, deconstruction, positional patterns.
// See lessons/06_structs_records/README.md, "Challenge".

namespace CSharpDojo.L06_StructsRecords;

/// <summary>A value type with value equality and a Deconstruct, all declared in one line.</summary>
public readonly record struct Point(int X, int Y);

public static class Geometry
{
    /// <summary>
    /// "origin" at (0, 0); "on the x axis" when only Y is 0; "on the y axis"
    /// when only X is 0; otherwise "quadrant 1".."quadrant 4" counting
    /// anticlockwise from the top right.
    /// </summary>
    public static string Classify(Point point) => point switch
    {
        (0, 0) => "origin",
        (_, 0) => "on the x axis",
        (0, _) => "on the y axis",
        ( > 0, > 0) => "quadrant 1",
        ( < 0, > 0) => "quadrant 2",
        ( < 0, < 0) => "quadrant 3",
        _ => "quadrant 4",
    };

    /// <summary>(3, 7) becomes (7, 3). Take the parts apart rather than reaching for .X twice.</summary>
    public static Point Mirror(Point point)
    {
        var (x, y) = point;
        return new Point(y, x);
    }
}
