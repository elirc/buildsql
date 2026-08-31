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
        return books.ToLookup(book => book.Author, book => book.Title);
    }

    /// <summary>
    /// Title by Id. A duplicate Id is a broken assumption, and the exception
    /// ToDictionary throws for one is the right answer.
    /// </summary>
    public static Dictionary<string, string> TitleById(IEnumerable<Book> books)
    {
        return books.ToDictionary(book => book.Id, book => book.Title);
    }

    /// <summary>How many books each author has.</summary>
    public static Dictionary<string, int> BookCountByAuthor(IEnumerable<Book> books)
    {
        return books
            .GroupBy(book => book.Author)
            .ToDictionary(group => group.Key, group => group.Count());
    }
}
