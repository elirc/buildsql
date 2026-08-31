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
    public bool Equals(Gram other) => Value == other.Value;

    /// <summary>The untyped one, which must agree - delegate to the typed version.</summary>
    public override bool Equals(object? obj) => obj is Gram other && Equals(other);

    public override int GetHashCode() => Value.GetHashCode();
}
