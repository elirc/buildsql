// d11_equality_semantics / ex3 - IEquatable on a struct.
// See lessons/d11_equality_semantics/README.md, "Exercise 3".

namespace CSharpDojo.D11_EqualitySemantics;

public readonly struct Gram : IEquatable<Gram>
{
    public Gram(int value)
    {
        Value = value;
    }

    public int Value { get; }

    /// <summary>The typed comparison. This is the one the framework prefers.</summary>
    public bool Equals(Gram other)
    {
        throw new NotImplementedException("ex3: Equals(Gram) is not implemented yet - edit this file.");
    }

    /// <summary>The untyped one, which must agree - delegate to the typed version.</summary>
    public override bool Equals(object? obj)
    {
        throw new NotImplementedException("ex3: Equals(object) is not implemented yet - edit this file.");
    }

    public override int GetHashCode()
    {
        throw new NotImplementedException("ex3: GetHashCode is not implemented yet - edit this file.");
    }
}
