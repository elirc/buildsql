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
    public override bool Equals(object? obj) =>
        obj is Tag other && string.Equals(Name, other.Name, StringComparison.Ordinal);

    public override int GetHashCode() => Name.GetHashCode(StringComparison.Ordinal);

    // NOTE: operator == is deliberately NOT overloaded. Do not add it.
}

public static class Tags
{
    /// <summary>Ask the type: a.Equals(b).</summary>
    public static bool EqualsSays(Tag a, Tag b) => a.Equals(b);

    /// <summary>Ask the operator: a == b.</summary>
    public static bool OperatorSays(Tag a, Tag b) => a == b;

    /// <summary>Ask the collection: does the list contain this tag?</summary>
    public static bool ListContains(List<Tag> tags, Tag tag) => tags.Contains(tag);
}
