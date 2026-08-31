// d12_efcore_relationships - given code, not an exercise. Read it, do not edit it.
//
// Author 1--* Book 1--* Review, and Book *--* Genre with no join entity in the
// model. Every relationship shape this lesson drills is declared here.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Author
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    /// <summary>Collection navigation: the "many" side of one-to-many.</summary>
    public List<Book> Books { get; set; } = [];
}

public class Book
{
    public int Id { get; set; }

    public string Title { get; set; } = "";

    public int Year { get; set; }

    /// <summary>The foreign key. Naming it &lt;Navigation&gt;Id is what wires it up.</summary>
    public int AuthorId { get; set; }

    public Author? Author { get; set; }

    public List<Review> Reviews { get; set; } = [];

    /// <summary>Skip navigation: many-to-many with no join entity of your own.</summary>
    public List<Genre> Genres { get; set; } = [];
}

public class Review
{
    public int Id { get; set; }

    public int BookId { get; set; }

    public Book? Book { get; set; }

    public int Stars { get; set; }

    public string Reviewer { get; set; } = "";
}

public class Genre
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public List<Book> Books { get; set; } = [];
}

public class D12Db(DbContextOptions<D12Db> options) : DbContext(options)
{
    public DbSet<Author> Authors => Set<Author>();

    public DbSet<Book> Books => Set<Book>();

    public DbSet<Review> Reviews => Set<Review>();

    public DbSet<Genre> Genres => Set<Genre>();
}

public record BookSummary(int Id, string Title);

public record AuthorDetail(int Id, string Name, List<BookSummary> Books);

public record NewBook(string? Title, int Year);

public record CreatedBook(int Id, string Title, int Year);

public record ReviewLine(string Reviewer, int Stars);

public record BookReviews(string Title, List<ReviewLine> Reviews);

public record AuthorRating(string Author, int Books, int AverageStars);

public record ShelfBook(string Title, List<string> Genres);

public record ShelfAuthor(string Author, List<ShelfBook> Books);

public class D12Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The gates replace this with a private in-memory database, per test.
        services.AddDbContext<D12Db>(options => options.UseSqlite("Data Source=dojo-d12.db"));
    }
}
