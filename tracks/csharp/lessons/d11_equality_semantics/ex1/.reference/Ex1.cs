// d11_equality_semantics / ex1 - three different questions.
// See lessons/d11_equality_semantics/README.md, "Exercise 1".

namespace CSharpDojo.D11_EqualitySemantics;

/// <summary>A plain class. It overrides nothing, on purpose.</summary>
public class Box
{
    public Box(int value)
    {
        Value = value;
    }

    public int Value { get; }
}

public static class Basics
{
    /// <summary>Are these the very same object? Ask the question that cannot be overridden.</summary>
    public static bool SameObject(object? a, object? b) => ReferenceEquals(a, b);

    /// <summary>What does Box itself say when asked whether two boxes are equal?</summary>
    public static bool BoxesEqual(Box a, Box b) => a.Equals(b);

    /// <summary>Compare two strings with ==.</summary>
    public static bool StringsEqual(string a, string b) => a == b;

    /// <summary>Are these two strings the very same object on the heap?</summary>
    public static bool StringsSameObject(string a, string b) => ReferenceEquals(a, b);
}
