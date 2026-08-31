// d19_linq_grouping / ex1 - the first grouping.
// See lessons/d19_linq_grouping/README.md, "Exercise 1".

namespace CSharpDojo.D19_LinqGrouping;

public static class Tally
{
    /// <summary>
    /// The words grouped by their first character. Groups appear in the order
    /// their key was first seen, and the words inside a group keep their input
    /// order.
    /// </summary>
    public static Dictionary<char, List<string>> ByFirstLetter(IEnumerable<string> words)
    {
        throw new NotImplementedException("ex1: ByFirstLetter is not implemented yet - edit this file.");
    }

    /// <summary>
    /// How many words there are of each length, as "5:2" entries ordered by
    /// length ascending.
    /// </summary>
    public static List<string> CountByLength(IEnumerable<string> words)
    {
        throw new NotImplementedException("ex1: CountByLength is not implemented yet - edit this file.");
    }
}
