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
        List<string> kept = new List<string>();
        foreach (string? field in fields)
        {
            if (!string.IsNullOrWhiteSpace(field))
            {
                kept.Add(field.Trim());
            }
        }

        return string.Join(", ", kept);
    }

    /// <summary>
    /// The inverse: split on ",", trim each field, and drop the blank ones.
    /// A null or blank line gives an empty list.
    /// </summary>
    public static List<string> Split(string? line)
    {
        List<string> fields = new List<string>();
        if (string.IsNullOrWhiteSpace(line))
        {
            return fields;
        }

        foreach (string part in line.Split(','))
        {
            if (!string.IsNullOrWhiteSpace(part))
            {
                fields.Add(part.Trim());
            }
        }

        return fields;
    }
}
