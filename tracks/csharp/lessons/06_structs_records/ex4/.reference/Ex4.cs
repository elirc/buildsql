// 06_structs_records / ex4 - the Equals/GetHashCode contract, by hand.
// See lessons/06_structs_records/README.md, "Exercise 4".

namespace CSharpDojo.L06_StructsRecords;

/// <summary>
/// A dictionary key. Two keys with the same region and id are the same key -
/// but a plain class compares by reference, so you have to say so yourself.
/// </summary>
public class CacheKey
{
    public CacheKey(string region, int id)
    {
        Region = region;
        Id = id;
    }

    public string Region { get; }

    public int Id { get; }

    /// <summary>Equal when the region and id both match.</summary>
    public override bool Equals(object? obj)
    {
        return obj is CacheKey other && other.Region == Region && other.Id == Id;
    }

    /// <summary>
    /// Two equal keys MUST return the same hash code, or a Dictionary will look
    /// in the wrong bucket and never find them.
    /// </summary>
    public override int GetHashCode()
    {
        return HashCode.Combine(Region, Id);
    }
}
