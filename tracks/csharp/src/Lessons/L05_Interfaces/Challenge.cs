// 05_interfaces / challenge - implementing an interface the framework already knows.
// See lessons/05_interfaces/README.md, "Challenge".

namespace CSharpDojo.L05_Interfaces;

/// <summary>
/// A semantic version. Implementing IComparable&lt;SemVer&gt; is what teaches
/// List&lt;T&gt;.Sort, Max, OrderBy and every sorted collection how to order these.
/// </summary>
public class SemVer : IComparable<SemVer>
{
    public SemVer(int major, int minor, int patch)
    {
        Major = major;
        Minor = minor;
        Patch = patch;
    }

    public int Major { get; }

    public int Minor { get; }

    public int Patch { get; }

    /// <summary>
    /// Negative when this sorts before <paramref name="other"/>, zero when they
    /// tie, positive when it sorts after. Null sorts before everything.
    /// </summary>
    public int CompareTo(SemVer? other)
    {
        throw new NotImplementedException("challenge: CompareTo is not implemented yet - edit this file.");
    }

    /// <summary>"1.2.3"</summary>
    public override string ToString()
    {
        throw new NotImplementedException("challenge: ToString is not implemented yet - edit this file.");
    }
}
