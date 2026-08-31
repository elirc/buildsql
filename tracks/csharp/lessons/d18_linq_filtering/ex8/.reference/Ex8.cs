// d18_linq_filtering / ex8 - optional filters, one page, and the total behind it.
// See lessons/d18_linq_filtering/README.md, "Exercise 8".

namespace CSharpDojo.D18_LinqFiltering;

// The gate builds these. Written for you.
public record Book(string Title, string Author, int Year, decimal Price);

public record SearchResult(List<Book> Page, int TotalMatches);

public static class Library
{
    /// <summary>
    /// Applies only the criteria that were supplied - a null author, a null
    /// fromYear or a null maxPrice means "do not filter on that at all" -
    /// orders what is left by Year ascending with ties broken by Title
    /// (ordinal), and returns one 1-based page of the result together with
    /// how many books matched in total, before the paging.
    /// </summary>
    public static SearchResult Search(
        IEnumerable<Book> books,
        string? author,
        int? fromYear,
        decimal? maxPrice,
        int pageNumber,
        int pageSize)
    {
        IEnumerable<Book> matches = books;

        if (author is not null)
        {
            matches = matches.Where(book => book.Author == author);
        }

        if (fromYear is not null)
        {
            matches = matches.Where(book => book.Year >= fromYear.Value);
        }

        if (maxPrice is not null)
        {
            matches = matches.Where(book => book.Price <= maxPrice.Value);
        }

        List<Book> ordered = matches
            .OrderBy(book => book.Year)
            .ThenBy(book => book.Title, StringComparer.Ordinal)
            .ToList();

        List<Book> page = ordered
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new SearchResult(page, ordered.Count);
    }
}
