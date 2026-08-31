// d23_pagination_filtering - given code, not an exercise. Read it, do not edit it.
//
// A job board. Twenty-five postings live in SQLite and every exercise in this
// set is a GET that has to slice them: a page, a sort, a filter, a cursor.
// The gates count SQL commands, so "correct" is not enough - hauling the whole
// table into memory and paging it there fails here even when the body matches.
//
// PostedDay is a plain integer, 1..60, counting days since the board opened.
// Tags is a comma separated list with no spaces, so "dotnet,sql" carries two
// tags. Note that "sql" and "nosql" are both real tags: a tag filter that asks
// whether Tags CONTAINS "sql" matches both, which is wrong.

using System.Linq.Expressions;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Posting
{
    public int Id { get; set; }

    public string Title { get; set; } = "";

    public string Company { get; set; } = "";

    /// <summary>One of D23Board.Locations.</summary>
    public string Location { get; set; } = "";

    public bool Remote { get; set; }

    public int SalaryMin { get; set; }

    public int SalaryMax { get; set; }

    /// <summary>Days since the board opened, 1..60.</summary>
    public int PostedDay { get; set; }

    /// <summary>Comma separated, no spaces. For example "dotnet,sql".</summary>
    public string Tags { get; set; } = "";
}

public class D23Db(DbContextOptions<D23Db> options) : DbContext(options)
{
    public DbSet<Posting> Postings => Set<Posting>();
}

public static class D23Board
{
    /// <summary>Every location a client may filter by. Anything else is a 400.</summary>
    public static readonly IReadOnlyList<string> Locations =
        ["Austin", "Berlin", "Denver", "Lisbon", "Oslo"];

    /// <summary>The whitelist for ?sort= on the offset endpoints (ex3 and ex8).</summary>
    public static readonly IReadOnlyList<string> Sorts =
        ["postedDay", "-postedDay", "salaryMax", "-salaryMax", "title"];

    /// <summary>The whitelist for ?sort= on the keyset feed (ex7). A cursor only
    /// works over the key it was cut for, so the feed sorts on PostedDay only.</summary>
    public static readonly IReadOnlyList<string> FeedSorts = ["postedDay", "-postedDay"];

    /// <summary>The largest page any endpoint in this set will serve.</summary>
    public const int MaxSize = 50;
}

/// <summary>
/// An opaque keyset cursor over (PostedDay, Id). Use these two methods - the
/// gates encode the cursors they send with the very same code, so rolling your
/// own format will not round trip.
/// </summary>
public static class D23Cursor
{
    public static string Encode(int postedDay, int id) =>
        Convert.ToBase64String(Encoding.UTF8.GetBytes($"{postedDay}:{id}"))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    public static bool TryDecode(string? cursor, out int postedDay, out int id)
    {
        postedDay = 0;
        id = 0;
        if (string.IsNullOrEmpty(cursor) || cursor.Length % 4 == 1)
        {
            return false;
        }

        string padded = cursor.Replace('-', '+').Replace('_', '/')
            + new string('=', (4 - cursor.Length % 4) % 4);

        try
        {
            string[] parts = Encoding.UTF8.GetString(Convert.FromBase64String(padded)).Split(':');
            return parts.Length == 2
                && int.TryParse(parts[0], out postedDay)
                && int.TryParse(parts[1], out id);
        }
        catch (FormatException)
        {
            postedDay = 0;
            id = 0;
            return false;
        }
    }
}

public record PostingCard(
    int Id,
    string Title,
    string Company,
    string Location,
    bool Remote,
    int SalaryMin,
    int SalaryMax,
    int PostedDay);

public static class D23Cards
{
    /// <summary>
    /// The Posting -> PostingCard projection, as an expression so it can be
    /// passed to Select and still be translated into SQL. Use it everywhere:
    /// `db.Postings.Where(...).OrderBy(...).Select(D23Cards.Card)`.
    /// </summary>
    public static readonly Expression<Func<Posting, PostingCard>> Card =
        p => new PostingCard(
            p.Id, p.Title, p.Company, p.Location, p.Remote, p.SalaryMin, p.SalaryMax, p.PostedDay);
}

/// <summary>The ex2 envelope: items, page, size, total, totalPages.</summary>
public record PostingPage(List<PostingCard> Items, int Page, int Size, int Total, int TotalPages);

/// <summary>The ex5 and ex8 envelope: the same plus next and prev link strings.</summary>
public record LinkedPage(
    List<PostingCard> Items,
    int Page,
    int Size,
    int Total,
    int TotalPages,
    string? Next,
    string? Prev);

/// <summary>The keyset envelope for ex6 and ex7: items, size, nextCursor.</summary>
public record CursorPage(List<PostingCard> Items, int Size, string? NextCursor);

public class D23Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The gates replace this with a private in-memory database, per test.
        services.AddDbContext<D23Db>(options => options.UseSqlite("Data Source=dojo-d23.db"));
    }
}
