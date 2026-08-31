// d11_equality_semantics / ex5 - the key that moved.
// See lessons/d11_equality_semantics/README.md, "Exercise 5".

namespace CSharpDojo.D11_EqualitySemantics;

/// <summary>
/// A key whose hash depends on a SETTABLE property. Written this way on
/// purpose, so the four methods below can show you what it costs.
/// </summary>
public class MutableKey
{
    public string Name { get; set; } = "";

    /// <summary>Equal to another MutableKey with the same name, ordinally.</summary>
    public override bool Equals(object? obj)
    {
        throw new NotImplementedException("ex5: Equals is not implemented yet - edit this file.");
    }

    public override int GetHashCode()
    {
        throw new NotImplementedException("ex5: GetHashCode is not implemented yet - edit this file.");
    }
}

public static class Hashing
{
    /// <summary>
    /// Put a key named "before" in a HashSet and ask whether the set contains
    /// it - all without changing anything.
    /// </summary>
    public static bool FoundBeforeMutation()
    {
        throw new NotImplementedException("ex5: FoundBeforeMutation is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The same, but rename the key to "after" once it is IN the set, and then
    /// ask the set whether it contains that same object.
    /// </summary>
    public static bool FoundAfterMutation()
    {
        throw new NotImplementedException("ex5: FoundAfterMutation is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The same again, but ask using a BRAND NEW key named "before" - the name
    /// the entry had when it went in.
    /// </summary>
    public static bool FoundByFreshOldNameKey()
    {
        throw new NotImplementedException("ex5: FoundByFreshOldNameKey is not implemented yet - edit this file.");
    }

    /// <summary>How many items the set reports after the rename.</summary>
    public static int CountAfterMutation()
    {
        throw new NotImplementedException("ex5: CountAfterMutation is not implemented yet - edit this file.");
    }
}
