// d18_linq_filtering / ex6 - filtering by type, and filtering out nothing-values.
// See lessons/d18_linq_filtering/README.md, "Exercise 6".

namespace CSharpDojo.D18_LinqFiltering;

public static class Narrow
{
    /// <summary>Only the items that really are ints, in order.</summary>
    public static List<int> IntsOnly(IEnumerable<object?> items)
    {
        return items.OfType<int>().ToList();
    }

    /// <summary>
    /// The entries that carry text - null, empty and whitespace-only entries
    /// are dropped - each one trimmed.
    /// </summary>
    public static List<string> Meaningful(IEnumerable<string?> entries)
    {
        return entries
            .Where(entry => !string.IsNullOrWhiteSpace(entry))
            .Select(entry => entry!.Trim())
            .ToList();
    }

    /// <summary>
    /// One description per item: "int:7", "text:hi", "null", or
    /// "other:Double" for anything else, using the runtime type's name.
    /// </summary>
    public static List<string> Describe(IEnumerable<object?> items)
    {
        return items.Select(item => item switch
        {
            null => "null",
            int number => $"int:{number}",
            string text => $"text:{text}",
            _ => $"other:{item.GetType().Name}",
        }).ToList();
    }
}
