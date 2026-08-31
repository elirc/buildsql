using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.D12_EfcoreRelationships;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Gates;

public class D12_EfcoreRelationshipsTests
{
    [Fact]
    public async Task Ex1_AnAuthorComesBackWithTheirBooks()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d12/authors/1");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d12/authors/1 must answer 200 - reread README ex1.");

        var ada = await response.Content.ReadFromJsonAsync<AuthorDto>();
        Teach.Equal("Ada", ada?.Name, "Author 1 is Ada.");
        Teach.Equal("Aurora,Bramble", Titles(ada),
            "She wrote two books, sorted by title. An empty list means the Books navigation "
                + "was never populated: EF does not load related data unless you ask, so a "
                + "plain FirstOrDefaultAsync leaves it empty rather than throwing.");

        var linus = await client.GetAsync("/d12/authors/3");
        await Teach.Status(HttpStatusCode.OK, linus,
            "Linus exists and has written nothing. That is a 200 with an empty list, not a "
                + "404 - the author is there, the collection is empty.");
        Teach.Equal("", Titles(await linus.Content.ReadFromJsonAsync<AuthorDto>()),
            "…with no books in it.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d12/authors/99"),
            "There is no author 99: 404.");
    }

    [Fact]
    public async Task Ex2_ManyToManyWorksFromBothEnds()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var genres = await client.GetAsync("/d12/books/2/genres");
        await Teach.Status(HttpStatusCode.OK, genres,
            "GET /d12/books/2/genres must answer 200 - reread README ex2.");
        Teach.Equal("essay,poetry", await Names(genres),
            "Bramble is tagged as both. One book, two genres - that is the \"many\" on this "
                + "side.");

        Teach.Equal("scifi", await Names(await client.GetAsync("/d12/books/1/genres")),
            "Aurora has exactly one.");

        var books = await client.GetAsync("/d12/genres/scifi/books");
        await Teach.Status(HttpStatusCode.OK, books,
            "GET /d12/genres/scifi/books must answer 200.");
        Teach.Equal("Aurora,Cinder", await Names(books),
            "Two books carry the scifi genre. The same join table, walked the other way - and "
                + "you never had to name it.");

        Teach.Equal("Bramble,Dust", await Names(await client.GetAsync("/d12/genres/poetry/books")),
            "…and poetry has its own two.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.GetAsync("/d12/books/99/genres"), "There is no book 99: 404.");
        await Teach.Status(HttpStatusCode.NotFound,
            await client.GetAsync("/d12/genres/nope/books"), "…and no genre called nope.");
    }

    [Fact]
    public async Task Ex3_TheForeignKeyIsAllTheNewChildNeeds()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var created = await client.PostAsJsonAsync("/d12/authors/1/books",
            new { title = "Ember", year = 1980 });
        await Teach.Status(HttpStatusCode.Created, created,
            "A successful create is 201 - reread README ex3.");
        Teach.Equal("/d12/books/5", created.Headers.Location?.ToString(),
            "Four books are seeded, so the new one is 5.");

        var book = await created.Content.ReadFromJsonAsync<CreatedBookDto>();
        Teach.Equal("Ember", book?.Title, "…and the body is the book that was created.");

        Teach.Equal(3, host.Query(db => db.Books.Count(b => b.AuthorId == 1)),
            "Ada now has three books. A count of 2 means the row was written without an "
                + "author, or with the wrong one - setting the AuthorId is what attaches it.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PostAsJsonAsync("/d12/authors/99/books",
                new { title = "Ghost", year = 1900 }),
            "There is no author 99, so there is nothing to attach a book to: 404.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PostAsJsonAsync("/d12/authors/1/books", new { title = "  ", year = 1900 }),
            "A blank title is a 400.");
        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PostAsJsonAsync("/d12/authors/1/books", new { title = "Nought", year = 0 }),
            "…and so is a year of 0.");

        Teach.Equal(5, host.Query(db => db.Books.Count()),
            "Three rejected requests must not have written anything.");
    }

    [Fact]
    public async Task Ex4_DeletingTheParentTakesTheChildrenWithIt()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        Teach.Equal(6, host.Query(db => db.Reviews.Count()), "Six reviews to begin with.");

        var deleted = await client.DeleteAsync("/d12/books/3");
        await Teach.Status(HttpStatusCode.NoContent, deleted,
            "A successful DELETE is 204 - reread README ex4.");

        Teach.Equal(3, host.Query(db => db.Books.Count()), "Three books are left…");
        Teach.Equal(4, host.Query(db => db.Reviews.Count()),
            "…and Cinder's two reviews went with it, without you writing a line about them. "
                + "Review.BookId is required, so the relationship is cascade-delete by "
                + "convention. A count of 6 means the reviews were orphaned; an exception "
                + "means the constraint fired and nothing was deleted.");
        Teach.Equal(0, host.Query(db => db.Books.Count(b => b.Id == 3)), "…and the book is gone.");

        await Teach.Status(HttpStatusCode.NotFound, await client.DeleteAsync("/d12/books/3"),
            "Deleting it again is a 404: you cannot remove an entity you did not load.");
    }

    [Fact]
    public async Task Ex5_TheIncludeCanCarryAFilter()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d12/books/1/reviews?minStars=4");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d12/books/1/reviews?minStars=4 must answer 200 - reread README ex5.");

        var body = await response.Content.ReadFromJsonAsync<ReviewsDto>();
        Teach.Equal("Aurora", body?.Title, "Book 1 is Aurora.");
        Teach.Equal("zoe|5", Reviews(body),
            "Aurora has a 5 from zoe and a 3 from yan, and only the 5 qualifies. Both coming "
                + "back means the filter ran on the client after every review had already "
                + "been fetched.");

        Teach.True(commands == 1,
            $"It took {commands} SQL commands. One query, with the filter in it.");

        var all = await client.GetFromJsonAsync<ReviewsDto>("/d12/books/1/reviews");
        Teach.Equal("yan|3,zoe|5", Reviews(all),
            "With no minStars the floor is 0, so both come back - sorted by reviewer.");

        var cinder = await client.GetFromJsonAsync<ReviewsDto>("/d12/books/3/reviews?minStars=3");
        Teach.Equal("yan|4", Reviews(cinder), "Cinder has a 4 and a 2, so only yan's survives.");

        var none = await client.GetFromJsonAsync<ReviewsDto>("/d12/books/2/reviews?minStars=5");
        Teach.Equal("", Reviews(none),
            "Bramble's only review is a 4, so nothing qualifies - and that is still a 200 with "
                + "the book and an empty list, not a 404.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.GetAsync("/d12/books/99/reviews"), "There is no book 99: 404.");
    }

    [Fact]
    public async Task Ex6_TheAverageCrossesTwoHopsInOneQuery()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d12/authors/ratings");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d12/authors/ratings must answer 200 - reread README ex6.");

        var ratings = await response.Content.ReadFromJsonAsync<List<RatingDto>>() ?? [];
        Teach.Equal("Ada,Grace,Linus", string.Join(",", ratings.Select(r => r.Author)),
            "Every author appears, sorted by name - including the one who has written "
                + "nothing. An inner join would have dropped him.");
        Teach.Equal("2,2,0", string.Join(",", ratings.Select(r => r.Books)),
            "Ada and Grace have two books each; Linus has none.");
        Teach.Equal("4,3,0", string.Join(",", ratings.Select(r => r.AverageStars)),
            "Ada's books were reviewed 5, 3 and 4 - a mean of 4. Grace's were 2, 4 and 5, "
                + "which is 3.67 truncated to 3. Linus has no reviews at all, and that has to "
                + "be a 0 rather than a crash: averaging an empty set throws unless you "
                + "average a nullable.");

        Teach.True(commands == 1,
            $"It took {commands} SQL commands. An aggregate over three tables is one query "
                + "when you say so in the projection, and one query per author when you loop.");
    }

    [Fact]
    public async Task Ex7_TwoLevelsOfCollectionStillCostOneQuery()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d12/library");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d12/library must answer 200 - reread README ex7.");

        var library = await response.Content.ReadFromJsonAsync<List<ShelfDto>>() ?? [];
        Teach.Equal("Ada,Grace,Linus", string.Join(",", library.Select(a => a.Author)),
            "Three authors, sorted by name, and the one with no books still appears.");

        Teach.Equal("Aurora[scifi],Bramble[essay poetry]", Shelf(library.ElementAtOrDefault(0)),
            "Ada's two books, by title, each with its own genres by name.");
        Teach.Equal("Cinder[essay scifi],Dust[poetry]", Shelf(library.ElementAtOrDefault(1)),
            "…and Grace's.");
        Teach.Equal("", Shelf(library.ElementAtOrDefault(2)), "Linus's shelf is empty.");

        Teach.True(commands == 1,
            $"It took {commands} SQL commands. A projection with collections inside "
                + "collections is still one query - EF fans the rows out and reassembles them. "
                + "Looping over authors and querying per book is the same answer and one round "
                + "trip per row.");
    }

    [Fact]
    public async Task Ex8_PuttingTheGenresReplacesTheWholeSet()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var replaced = await client.PutAsJsonAsync("/d12/books/1/genres",
            new[] { "essay", "poetry" });
        await Teach.Status(HttpStatusCode.NoContent, replaced,
            "A successful replacement is 204 - reread README ex8.");

        Teach.Equal("essay,poetry", await Names(await client.GetAsync("/d12/books/1/genres")),
            "Aurora was scifi and is now essay and poetry. Both new ones present and the old "
                + "one gone is the whole meaning of PUT - adding without clearing leaves three.");

        var unknown = await client.PutAsJsonAsync("/d12/books/1/genres",
            new[] { "essay", "steampunk" });
        await Teach.Status(HttpStatusCode.BadRequest, unknown,
            "There is no steampunk genre. Creating one on the fly would let a typo invent "
                + "vocabulary; a 400 says so.");
        Teach.True((await unknown.Content.ReadAsStringAsync()).Contains("steampunk"),
            "…and the message quotes the name it did not recognise.");
        Teach.Equal("essay,poetry", await Names(await client.GetAsync("/d12/books/1/genres")),
            "…and a rejected request must have changed nothing - validate every name BEFORE "
                + "you clear the set.");

        var cleared = await client.PutAsJsonAsync("/d12/books/2/genres", Array.Empty<string>());
        await Teach.Status(HttpStatusCode.NoContent, cleared,
            "An empty array is a valid request: it means \"no genres\".");
        Teach.Equal("", await Names(await client.GetAsync("/d12/books/2/genres")),
            "…and Bramble now has none.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PutAsJsonAsync("/d12/books/99/genres", new[] { "essay" }),
            "There is no book 99: 404.");
    }

    // … private helpers and DTO records, listed below …

    private static SqliteHost<D12Db> NewHost() =>
        new SqliteHost<D12Db>().Seed(db =>
        {
            var scifi = new Genre { Id = 1, Name = "scifi" };
            var essay = new Genre { Id = 2, Name = "essay" };
            var poetry = new Genre { Id = 3, Name = "poetry" };
            db.Genres.AddRange(scifi, essay, poetry);

            db.Authors.AddRange(
                new Author { Id = 1, Name = "Ada" },
                new Author { Id = 2, Name = "Grace" },
                new Author { Id = 3, Name = "Linus" });

            db.Books.AddRange(
                new Book { Id = 1, Title = "Aurora", Year = 1965, AuthorId = 1, Genres = [scifi] },
                new Book { Id = 2, Title = "Bramble", Year = 1815, AuthorId = 1, Genres = [essay, poetry] },
                new Book { Id = 3, Title = "Cinder", Year = 1951, AuthorId = 2, Genres = [scifi, essay] },
                new Book { Id = 4, Title = "Dust", Year = 1996, AuthorId = 2, Genres = [poetry] });

            db.Reviews.AddRange(
                new Review { Id = 1, BookId = 1, Stars = 5, Reviewer = "zoe" },
                new Review { Id = 2, BookId = 1, Stars = 3, Reviewer = "yan" },
                new Review { Id = 3, BookId = 2, Stars = 4, Reviewer = "zoe" },
                new Review { Id = 4, BookId = 3, Stars = 2, Reviewer = "xu" },
                new Review { Id = 5, BookId = 3, Stars = 4, Reviewer = "yan" },
                new Review { Id = 6, BookId = 4, Stars = 5, Reviewer = "xu" });
        });

    private static async Task<string> Names(HttpResponseMessage response) =>
        string.Join(",", await response.Content.ReadFromJsonAsync<List<string>>() ?? []);

    private static string Titles(AuthorDto? author) =>
        string.Join(",", (author?.Books ?? []).Select(b => b.Title));

    private static string Reviews(ReviewsDto? book) =>
        string.Join(",", (book?.Reviews ?? []).Select(r => $"{r.Reviewer}|{r.Stars}"));

    private static string Shelf(ShelfDto? author) =>
        string.Join(",", (author?.Books ?? [])
            .Select(b => $"{b.Title}[{string.Join(" ", b.Genres ?? [])}]"));

    private sealed record BookDto(int Id, string? Title);

    private sealed record AuthorDto(int Id, string? Name, List<BookDto>? Books);

    private sealed record CreatedBookDto(int Id, string? Title, int Year);

    private sealed record ReviewDto(string? Reviewer, int Stars);

    private sealed record ReviewsDto(string? Title, List<ReviewDto>? Reviews);

    private sealed record RatingDto(string? Author, int Books, int AverageStars);

    private sealed record ShelfBookDto(string? Title, List<string>? Genres);

    private sealed record ShelfDto(string? Author, List<ShelfBookDto>? Books);
}
