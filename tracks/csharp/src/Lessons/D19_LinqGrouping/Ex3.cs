// d19_linq_grouping / ex3 - lookups and dictionaries are not the same thing.
// See lessons/d19_linq_grouping/README.md, "Exercise 3".

namespace CSharpDojo.D19_LinqGrouping;

// The gate builds these. Written for you.
public record Book(string Id, string Title, string Author);

public static class Indexing
{
    /// <summary>
    /// Every author's titles, in input order. A key nobody wrote under must
    /// give an empty sequence rather than throwing.
    /// </summary>
    public static ILookup<string, string> TitlesByAuthor(IEnumerable<Book> books)
    {
        throw new NotImplementedException("ex3: TitlesByAuthor is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Title by Id. A duplicate Id is a broken assumption, and the exception
    /// ToDictionary throws for one is the right answer.
    /// </summary>
    public static Dictionary<string, string> TitleById(IEnumerable<Book> books)
    {
        throw new NotImplementedException("ex3: TitleById is not implemented yet - edit this file.");
    }

    /// <summary>How many books each author has.</summary>
    public static Dictionary<string, int> BookCountByAuthor(IEnumerable<Book> books)
    {
        throw new NotImplementedException("ex3: BookCountByAuthor is not implemented yet - edit this file.");
    }
}
