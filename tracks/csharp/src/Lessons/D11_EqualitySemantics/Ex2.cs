// d11_equality_semantics / ex2 - Equals and GetHashCode, together.
// See lessons/d11_equality_semantics/README.md, "Exercise 2".

namespace CSharpDojo.D11_EqualitySemantics;

public class Isbn
{
    /// <summary>The code, trimmed. Blank or null is an ArgumentException.</summary>
    public Isbn(string code)
    {
        throw new NotImplementedException("ex2: the Isbn constructor is not implemented yet - edit this file.");
    }

    public string Code { get; } = "";

    /// <summary>
    /// Equal to another Isbn with the same code, compared ORDINALLY and
    /// ignoring case. Anything that is not an Isbn - including null - is not
    /// equal.
    /// </summary>
    public override bool Equals(object? obj)
    {
        throw new NotImplementedException("ex2: Equals is not implemented yet - edit this file.");
    }

    /// <summary>
    /// A hash built from exactly the same information the comparison uses -
    /// which means it must ignore case too.
    /// </summary>
    public override int GetHashCode()
    {
        throw new NotImplementedException("ex2: GetHashCode is not implemented yet - edit this file.");
    }
}
