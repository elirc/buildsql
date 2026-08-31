// d11_equality_semantics / ex4 - when == disagrees with Equals.
// See lessons/d11_equality_semantics/README.md, "Exercise 4".

namespace CSharpDojo.D11_EqualitySemantics;

public class Tag
{
    public Tag(string name)
    {
        Name = name;
    }

    public string Name { get; }

    /// <summary>Equal to another Tag with the same name, compared ordinally.</summary>
    public override bool Equals(object? obj)
    {
        throw new NotImplementedException("ex4: Equals is not implemented yet - edit this file.");
    }

    public override int GetHashCode()
    {
        throw new NotImplementedException("ex4: GetHashCode is not implemented yet - edit this file.");
    }

    // NOTE: operator == is deliberately NOT overloaded. Do not add it.
}

public static class Tags
{
    /// <summary>Ask the type: a.Equals(b).</summary>
    public static bool EqualsSays(Tag a, Tag b)
    {
        throw new NotImplementedException("ex4: EqualsSays is not implemented yet - edit this file.");
    }

    /// <summary>Ask the operator: a == b.</summary>
    public static bool OperatorSays(Tag a, Tag b)
    {
        throw new NotImplementedException("ex4: OperatorSays is not implemented yet - edit this file.");
    }

    /// <summary>Ask the collection: does the list contain this tag?</summary>
    public static bool ListContains(List<Tag> tags, Tag tag)
    {
        throw new NotImplementedException("ex4: ListContains is not implemented yet - edit this file.");
    }
}
