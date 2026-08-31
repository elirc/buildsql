// d01_types_conversion / ex6 - parsing text you did not write.
// See lessons/d01_types_conversion/README.md, "Exercise 6".

namespace CSharpDojo.D01_TypesConversion;

public static class Fields
{
    /// <summary>
    /// Read a money amount out of raw user text.
    /// Rules: null, empty or whitespace-only text is a failure; surrounding
    /// whitespace is ignored; one leading "$" is allowed; the number itself is
    /// read with the INVARIANT culture, allowing a sign and "," group
    /// separators. On failure return false and leave amount at 0.
    /// </summary>
    public static bool TryReadAmount(string? raw, out decimal amount)
    {
        throw new NotImplementedException("ex6: TryReadAmount is not implemented yet - edit this file.");
    }
}
