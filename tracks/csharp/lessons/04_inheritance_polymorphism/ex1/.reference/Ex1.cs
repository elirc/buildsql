// 04_inheritance_polymorphism / ex1 - an abstract base with two implementations.
// See lessons/04_inheritance_polymorphism/README.md, "Exercise 1".

namespace CSharpDojo.L04_InheritancePolymorphism;

/// <summary>
/// A shape knows its name and can work out its area - but "a shape" in general
/// has no formula, which is exactly what abstract means.
/// </summary>
public abstract class Shape
{
    protected Shape(string name)
    {
        Name = name;
    }

    public string Name { get; }

    public abstract double Area();
}

public class Rectangle : Shape
{
    public Rectangle(double width, double height)
        : base("rectangle")
    {
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

public class Circle : Shape
{
    public Circle(double radius)
        : base("circle")
    {
        Radius = radius;
    }

    public double Radius { get; }

    public override double Area()
    {
        return Math.PI * Radius * Radius;
    }
}
