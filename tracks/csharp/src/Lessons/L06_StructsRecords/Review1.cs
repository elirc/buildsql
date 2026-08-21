// 06_structs_records / review1 - how deep does record equality (and `with`) go?
// See lessons/06_structs_records/README.md, "Review".

namespace CSharpDojo.L06_StructsRecords;

public record Basket(string Owner, List<string> Items);

public static class Baskets
{
    /// <summary>Whatever the record's own equality says about these two. Just ask it.</summary>
    public static bool RecordSays(Basket a, Basket b)
    {
        throw new NotImplementedException("review1: RecordSays is not implemented yet - edit this file.");
    }

    /// <summary>
    /// True when the owners match and the two item lists hold the same strings
    /// in the same order - the question a human means by "same basket".
    /// </summary>
    public static bool SameContents(Basket a, Basket b)
    {
        throw new NotImplementedException("review1: SameContents is not implemented yet - edit this file.");
    }

    /// <summary>The same basket under a new owner's name.</summary>
    public static Basket Rename(Basket basket, string newOwner)
    {
        throw new NotImplementedException("review1: Rename is not implemented yet - edit this file.");
    }
}
