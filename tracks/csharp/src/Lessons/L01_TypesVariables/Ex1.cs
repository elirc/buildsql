// 01_types_variables / ex1 - copying a value type vs copying a reference type.
// See lessons/01_types_variables/README.md, "Exercise 1".

namespace CSharpDojo.L01_TypesVariables;

/// <summary>A value type. Assignment copies the whole thing.</summary>
public struct ReadingValue
{
    public int Degrees;
}

/// <summary>A reference type. Assignment copies the arrow, not the object.</summary>
public class ReadingRef
{
    public int Degrees;
}

public static class Copies
{
    /// <summary>
    /// Copy <paramref name="original"/> into a local variable, set the local's
    /// Degrees to 99, then return the ORIGINAL's Degrees.
    /// </summary>
    public static int AfterCopyingAStruct(ReadingValue original)
    {
        throw new NotImplementedException("ex1: AfterCopyingAStruct is not implemented yet - edit this file.");
    }

    /// <summary>The same three steps, with the class instead of the struct.</summary>
    public static int AfterCopyingAClass(ReadingRef original)
    {
        throw new NotImplementedException("ex1: AfterCopyingAClass is not implemented yet - edit this file.");
    }
}
