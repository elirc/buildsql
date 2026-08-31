# d12 — EF Core relationship drills

Eight problems on navigations: loading the "many" side, walking a many-to-many
both ways, creating a child, cascade delete, filtered includes, aggregating
across two hops, nested collection projections, and replacing a many-to-many
set. They drill lesson **06_efcore_relationships**.

Everything is under `/d12/…` against
`src/Api/D12_EfcoreRelationships/Model.cs`: `Author 1--* Book 1--* Review`, and
`Book *--* Genre` with no join entity in the model.

The seed: **authors** Ada, Grace, Linus (who has written nothing); **books**
Aurora (Ada, scifi), Bramble (Ada, essay + poetry), Cinder (Grace, scifi +
essay), Dust (Grace, poetry); **reviews** zoe 5 and yan 3 on Aurora, zoe 4 on
Bramble, xu 2 and yan 4 on Cinder, xu 5 on Dust.

## Exercise 1 — an author and their books

Edit `src/Api/D12_EfcoreRelationships/Ex1.cs`.
`GET /d12/authors/{id:int}` → **200** with
`{"id": …, "name": …, "books": [{"id": …, "title": …}]}`, books by title.

An author who has written nothing is a **200 with an empty list**; an author who
does not exist is a **404**.

```
uv run dojo test dotnet d12_efcore_relationships ex1
```

## Exercise 2 — many-to-many, both ways

Edit `src/Api/D12_EfcoreRelationships/Ex2.cs`.

- `GET /d12/books/{id:int}/genres` — **200** with the genre names, sorted;
  **404** when there is no such book
- `GET /d12/genres/{name}/books` — **200** with the titles, sorted; **404** when
  there is no such genre

```
uv run dojo test dotnet d12_efcore_relationships ex2
```

## Exercise 3 — create a child

Edit `src/Api/D12_EfcoreRelationships/Ex3.cs`.
`POST /d12/authors/{id:int}/books` with `{"title": …, "year": …}` → **201** with
`Location: /d12/books/{id}` and `{"id": …, "title": …, "year": …}`, attached to
that author.

**404** when the author does not exist; **400** for a blank title or a year
below 1, writing nothing.

```
uv run dojo test dotnet d12_efcore_relationships ex3
```

## Exercise 4 — what happens to the children

Edit `src/Api/D12_EfcoreRelationships/Ex4.cs`.
`DELETE /d12/books/{id:int}` → **204** when the book is now gone, **404** when it
was not there.

Its reviews go with it, and so do its rows in the book–genre join table —
without you writing a line about either.

```
uv run dojo test dotnet d12_efcore_relationships ex4
```

## Exercise 5 — load some of the children

Edit `src/Api/D12_EfcoreRelationships/Ex5.cs`.
`GET /d12/books/{id:int}/reviews?minStars=…` → **200** with
`{"title": …, "reviews": [{"reviewer": …, "stars": …}]}` — only the reviews of at
least `minStars` (default 0), sorted by reviewer. **404** when there is no such
book.

The filtering happens in the database: **one** SQL command, and the reviews that
did not qualify are never fetched.

```
uv run dojo test dotnet d12_efcore_relationships ex5
```

## Exercise 6 — aggregate across two hops

Edit `src/Api/D12_EfcoreRelationships/Ex6.cs`.
`GET /d12/authors/ratings` → **200** with one row per author —
`{"author": …, "books": …, "averageStars": …}` — sorted by name, in **one** SQL
command.

The average is over every review of every one of that author's books, truncated
to a whole number. An author with no reviews averages **0**, and an author with
no books still appears.

```
uv run dojo test dotnet d12_efcore_relationships ex6
```

## Exercise 7 — collections inside collections

Edit `src/Api/D12_EfcoreRelationships/Ex7.cs`. `GET /d12/library` → **200**
with `[{"author": …, "books": [{"title": …, "genres": [ … ]}]}]` — authors by
name, books by title, genres by name, and an author with no books still there.

**One** SQL command for the whole shape.

```
uv run dojo test dotnet d12_efcore_relationships ex7
```

## Exercise 8 — replace the set

Edit `src/Api/D12_EfcoreRelationships/Ex8.cs`.
`PUT /d12/books/{id:int}/genres` takes a JSON array of genre names — the
complete list the book should have afterwards:

- **204** — the book now carries exactly those, no more and no fewer
- **404** — there is no such book
- **400** — a name that is not a genre, quoting it, and nothing changes

An empty array is a valid request: it means "no genres".

```
uv run dojo test dotnet d12_efcore_relationships ex8
```

## The gate

This is the entire gate class, `tests/Gates/D12_EfcoreRelationshipsTests.cs`:

```csharp
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
}
```

…where the helpers are `NewHost` (a `SqliteHost<D12Db>` with the seed above),
`Names`, `Titles`, `Reviews` and `Shelf`, plus eight `private sealed record`
DTOs.
