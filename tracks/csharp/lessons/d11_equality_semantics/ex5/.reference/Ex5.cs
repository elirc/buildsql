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
    public override bool Equals(object? obj) =>
        obj is MutableKey other && string.Equals(Name, other.Name, StringComparison.Ordinal);

    public override int GetHashCode() => Name.GetHashCode(StringComparison.Ordinal);
}

public static class Hashing
{
    /// <summary>
    /// Put a key named "before" in a HashSet and ask whether the set contains
    /// it - all without changing anything.
    /// </summary>
    public static bool FoundBeforeMutation()
    {
        MutableKey key = new MutableKey { Name = "before" };
        HashSet<MutableKey> set = new HashSet<MutableKey> { key };
        return set.Contains(key);
    }

    /// <summary>
    /// The same, but rename the key to "after" once it is IN the set, and then
    /// ask the set whether it contains that same object.
    /// </summary>
    public static bool FoundAfterMutation()
    {
        MutableKey key = new MutableKey { Name = "before" };
        HashSet<MutableKey> set = new HashSet<MutableKey> { key };
        key.Name = "after";
        return set.Contains(key);
    }

    /// <summary>
    /// The same again, but ask using a BRAND NEW key named "before" - the name
    /// the entry had when it went in.
    /// </summary>
    public static bool FoundByFreshOldNameKey()
    {
        MutableKey key = new MutableKey { Name = "before" };
        HashSet<MutableKey> set = new HashSet<MutableKey> { key };
        key.Name = "after";
        return set.Contains(new MutableKey { Name = "before" });
    }

    /// <summary>How many items the set reports after the rename.</summary>
    public static int CountAfterMutation()
    {
        MutableKey key = new MutableKey { Name = "before" };
        HashSet<MutableKey> set = new HashSet<MutableKey> { key };
        key.Name = "after";
        return set.Count;
    }
}
