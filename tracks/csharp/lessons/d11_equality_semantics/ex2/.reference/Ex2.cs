// d11_equality_semantics / ex2 - Equals and GetHashCode, together.
// See lessons/d11_equality_semantics/README.md, "Exercise 2".

namespace CSharpDojo.D11_EqualitySemantics;

public class Isbn
{
    /// <summary>The code, trimmed. Blank or null is an ArgumentException.</summary>
    public Isbn(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("An ISBN needs a code.", nameof(code));
        }

        Code = code.Trim();
    }

    public string Code { get; } = "";

    /// <summary>
    /// Equal to another Isbn with the same code, compared ORDINALLY and
    /// ignoring case. Anything that is not an Isbn - including null - is not
    /// equal.
    /// </summary>
    public override bool Equals(object? obj) =>
        obj is Isbn other && string.Equals(Code, other.Code, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// A hash built from exactly the same information the comparison uses -
    /// which means it must ignore case too.
    /// </summary>
    public override int GetHashCode() => StringComparer.OrdinalIgnoreCase.GetHashCode(Code);
}
