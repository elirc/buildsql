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
        throw new NotImplementedException("ex3: the Rect constructor is not implemented yet - edit this file.");
    }

    public double Width { get; }

    public double Height { get; }

    public override double Area()
    {
        throw new NotImplementedException("ex3: Area is not implemented yet - edit this file.");
    }
}

public sealed class Circle : Shape
{
    public Circle(double radius)
    {
        throw new NotImplementedException("ex3: the Circle constructor is not implemented yet - edit this file.");
    }

    public double Radius { get; }

    public override double Area()
    {
        throw new NotImplementedException("ex3: Area is not implemented yet - edit this file.");
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
        throw new NotImplementedException("ex3: Describe is not implemented yet - edit this file.");
    }

    /// <summary>The areas added up, rounded to two places. Zero for nothing.</summary>
    public static double TotalArea(IEnumerable<Shape> shapes)
    {
        throw new NotImplementedException("ex3: TotalArea is not implemented yet - edit this file.");
    }
}
