// d02_strings_formatting / ex3 - splitting and joining a delimited line.
// See lessons/d02_strings_formatting/README.md, "Exercise 3".

namespace CSharpDojo.D02_StringsFormatting;

public static class Csv
{
    /// <summary>
    /// Join the fields with ", ", trimming each one and dropping any that is
    /// null or blank once trimmed.
    /// </summary>
    public static string Join(IEnumerable<string?> fields)
    {
        throw new NotImplementedException("ex3: Join is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The inverse: split on ",", trim each field, and drop the blank ones.
    /// A null or blank line gives an empty list.
    /// </summary>
    public static List<string> Split(string? line)
    {
        throw new NotImplementedException("ex3: Split is not implemented yet - edit this file.");
    }
}
