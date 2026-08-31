// d11_equality_semantics / ex8 - equality and inheritance.
// See lessons/d11_equality_semantics/README.md, "Exercise 8".

namespace CSharpDojo.D11_EqualitySemantics;

public class Point2
{
    public Point2(int x, int y)
    {
        X = x;
        Y = y;
    }

    public int X { get; }

    public int Y { get; }

    /// <summary>
    /// Equal to another object of EXACTLY this runtime type holding the same
    /// coordinates. Comparing with `obj is Point2` would make a base instance
    /// equal to a derived one but not the other way round - use GetType().
    /// </summary>
    public override bool Equals(object? obj)
    {
        if (obj is null || GetType() != obj.GetType())
        {
            return false;
        }

        Point2 other = (Point2)obj;
        return X == other.X && Y == other.Y;
    }

    public override int GetHashCode() => HashCode.Combine(X, Y);
}

public class ColouredPoint : Point2
{
    public ColouredPoint(int x, int y, string colour)
        : base(x, y)
    {
        Colour = colour;
    }

    public string Colour { get; }

    /// <summary>
    /// The base's answer, plus the colour. base.Equals has already established
    /// that the runtime types match.
    /// </summary>
    public override bool Equals(object? obj) =>
        base.Equals(obj)
        && string.Equals(Colour, ((ColouredPoint)obj!).Colour, StringComparison.Ordinal);

    public override int GetHashCode() => HashCode.Combine(base.GetHashCode(), Colour);
}
