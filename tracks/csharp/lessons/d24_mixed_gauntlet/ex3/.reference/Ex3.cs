// d24_mixed_gauntlet / ex3 - a hierarchy, a pattern and a guard.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 3".

using System.Globalization;

namespace CSharpDojo.D24_MixedGauntlet;

public abstract class Shape
{
    public abstract double Area();
}

public sealed class Rect : Shape
{
    public Rect(double width, double height)
    {
        if (width <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(width), width, "width must be positive");
        }

        if (height <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(height), height, "height must be positive");
        }

        Width = width;
        Height = height;
    }

    public double Width { get; }

    public double Height { get; }

    public override double Area()
    {
        return Width * Height;
    }
}

public sealed class Circle : Shape
{
    public Circle(double radius)
    {
        if (radius <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(radius), radius, "radius must be positive");
        }

        Radius = radius;
    }

    public double Radius { get; }

    public override double Area()
    {
        return Math.PI * Radius * Radius;
    }
}

public static class Shapes
{
    /// <summary>
    /// "rect 6" or "circle 12.57" - the kind, a space, and the area rounded to
    /// two decimal places and written with the invariant culture. Any other
    /// Shape is "shape" followed by its area.
    /// </summary>
    public static string Describe(Shape shape)
    {
        string kind = shape switch
        {
            Rect => "rect",
            Circle => "circle",
            _ => "shape",
        };

        return $"{kind} {Math.Round(shape.Area(), 2).ToString(CultureInfo.InvariantCulture)}";
    }

    /// <summary>The areas added up, rounded to two places. Zero for nothing.</summary>
    public static double TotalArea(IEnumerable<Shape> shapes)
    {
        return Math.Round(shapes.Sum(shape => shape.Area()), 2);
    }
}
