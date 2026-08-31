// d10_records_structs / ex6 - every struct has a constructor you did not write.
// See lessons/d10_records_structs/README.md, "Exercise 6".

namespace CSharpDojo.D10_RecordsStructs;

public readonly struct Currency
{
    /// <summary>
    /// A code of exactly three letters, stored upper-cased with the invariant
    /// culture. Anything else is an ArgumentException.
    /// </summary>
    public Currency(string code)
    {
        throw new NotImplementedException("ex6: the Currency constructor is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The three-letter code - or NULL for a Currency that was never
    /// constructed, because `default` bypasses every constructor you write.
    /// </summary>
    public string Code { get; }

    /// <summary>True when this is the zeroed default rather than a real currency.</summary>
    public bool IsDefault =>
        throw new NotImplementedException("ex6: IsDefault is not implemented yet - edit this file.");

    /// <summary>The code, or "???" when there is none.</summary>
    public string Safe => throw new NotImplementedException("ex6: Safe is not implemented yet - edit this file.");
}
