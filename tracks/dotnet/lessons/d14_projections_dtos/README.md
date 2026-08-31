# d14 - projection and DTO drills

Eight problems on turning entity graphs into wire shapes: `Select` into a
record, nested collections, conditionals and aggregates computed in the
database, and doing all of it inside a query budget. They drill lessons
**06_efcore_relationships** and **07_rest_crud** - go back to those if
"projection" still sounds like a synonym for `Include`.

The domain is a small cinema: directors, their films, and the screenings of
each film. Two columns exist for the back office only - `Director.Email` and
`Film.BudgetCents` - and several gates read the raw response body looking for
them. The gates also count the SQL commands EF Core sends, so a correct body
assembled by hauling tables into memory still fails. Read
`src/Api/D14_ProjectionsDtos/Model.cs` first; everything is under `/d14/...`
and each exercise owns one file.

## Exercise 1 - the list is a contract, not a table dump

Edit `src/Api/D14_ProjectionsDtos/Ex1.cs`. `GET /d14/films` must answer 200
with every film as a `FilmCard` - `id`, `title`, `year` and the *director's
name* - newest year first, ties broken by title A-Z.

One SQL query, and neither `email` nor `budget` may appear anywhere in the
body. Run the shipped version once and read what the serializer says about the
`Film` -> `Director` -> `Films` cycle.

```
uv run dojo test dotnet d14_projections_dtos ex1
```

## Exercise 2 - a director and their titles in one query

Edit `src/Api/D14_ProjectionsDtos/Ex2.cs`. `GET /d14/directors/{id}` answers
200 with a `DirectorFilms` - the director's `name` and their film *titles*,
oldest year first - or 404 when there is no such director.

The whole answer, name and nested list together, costs exactly one query.

```
uv run dojo test dotnet d14_projections_dtos ex2
```

## Exercise 3 - the status comes out of the database

Edit `src/Api/D14_ProjectionsDtos/Ex3.cs`. `GET /d14/screenings/board` answers
200 with every screening as a `ScreeningBoardRow`, id ascending, where
`status` is:

- `"sold out"` when `sold >= seats`
- `"filling"` when the house is 80% full or more - integer math,
  `sold * 10 >= seats * 8`, no doubles
- `"open"` otherwise

The shipped version reports everything as open. One query, and the raw seat
counts never reach the client.

```
uv run dojo test dotnet d14_projections_dtos ex3
```

## Exercise 4 - the films nobody is showing

Edit `src/Api/D14_ProjectionsDtos/Ex4.cs`. `GET /d14/films/quiet` answers 200
with every film that has *no* screenings at all, as a `QuietFilm`, title A-Z.
One query - the absence test runs in the database, not over a list you loaded.

```
uv run dojo test dotnet d14_projections_dtos ex4
```

## Exercise 5 - the earliest screening, inside the projection

Edit `src/Api/D14_ProjectionsDtos/Ex5.cs`. `GET /d14/films/next-showing`
answers 200 with EVERY film as a `NextShowing`, title A-Z. `nextDay` and
`nextRoom` come from that film's earliest screening - lowest day, ties broken
by screening id - and a film with no screenings reports `null` for both while
still appearing in the list.

One query for all of it.

```
uv run dojo test dotnet d14_projections_dtos ex5
```

## Exercise 6 - two levels of shaping, with a filter inside

Edit `src/Api/D14_ProjectionsDtos/Ex6.cs`. `GET /d14/directors/slate` answers
200 with every director as a `DirectorSlate`, name A-Z. Inside each: ALL of
their films (title A-Z) as `SlateFilm`s, and inside each film the rooms of its
screenings that still have seats (`sold < seats`), room A-Z.

A film with nothing open still appears, with an empty room list. At most two
SQL queries.

```
uv run dojo test dotnet d14_projections_dtos ex6
```

## Exercise 7 - one search box, two shapes, one contract

Edit `src/Api/D14_ProjectionsDtos/Ex7.cs`. `GET /d14/search?q=` searches film
titles and director names, case-insensitively, and answers 200 with a list of
`SearchHit`:

- matching FILMS first - `kind` `"film"`, `label` the title, `year` filled,
  title A-Z
- then matching DIRECTORS - `kind` `"director"`, `label` the name, `year`
  null, name A-Z

A missing or blank `q` is 400 as a validation problem whose `errors`
dictionary is keyed `"q"`. At most two queries, and no internal columns in the
body.

```
uv run dojo test dotnet d14_projections_dtos ex7
```

## Exercise 8 - the whole dashboard on a query budget

Edit `src/Api/D14_ProjectionsDtos/Ex8.cs`. `GET /d14/dashboard` answers 200
with a `Dashboard`:

- `films` - how many films exist
- `screenings` - how many screenings exist
- `seatsSold` - total tickets sold across all screenings
- `soldOut` - how many screenings have `sold >= seats`
- `top` - the top THREE films by percent sold, as `TopFilm`s:
  `sum(sold) * 100 / sum(seats)` over that film's screenings, integer
  division, films with no screenings excluded, highest percent first, ties
  broken by title A-Z

At most three SQL queries for all of it.

```
uv run dojo test dotnet d14_projections_dtos ex8
```

## The gate

This is the entire gate class, `tests/Gates/D14_ProjectionsDtosTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.D14_ProjectionsDtos;

namespace DotnetDojo.Gates;

public class D14_ProjectionsDtosTests
{
    [Fact]
    public async Task Ex1_TheListIsACardNotAnEntityGraph()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d14/films");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d14/films must answer 200. A 500 whose body mentions an object cycle is "
                + "the serializer meeting Film -> Director -> Films -> ... : you handed it "
                + "entities. Reread README ex1.");

        var cards = await response.Content.ReadFromJsonAsync<List<CardDto>>();
        Teach.Equal("3,4,6,1,2,5", string.Join(",", (cards ?? []).Select(c => c.Id)),
            "Newest year first (2023, 2023, 2022, 2021, 2019, 2016), ties by title A-Z: "
                + "Paper Sun before Static Field.");
        Teach.Equal("Mira Vale,Suki Anand,Suki Anand,Mira Vale,Otto Reiner,Otto Reiner",
            string.Join(",", (cards ?? []).Select(c => c.Director)),
            "Each card carries the director's NAME, pulled through the navigation inside "
                + "the projection.");

        Teach.Equal(1, host.Commands.Count,
            "One query. The projection joins the director in; loading films and directors "
                + "separately - or per film - costs more.");

        string raw = await response.Content.ReadAsStringAsync();
        Teach.True(!raw.Contains("email", StringComparison.OrdinalIgnoreCase),
            "The director's email is in the body. Entities leak internal columns; a "
                + "FilmCard cannot.\n  body: " + Truncate(raw));
        Teach.True(!raw.Contains("budget", StringComparison.OrdinalIgnoreCase),
            "...and so is the film budget. Select the four card fields and nothing else.");
    }

    [Fact]
    public async Task Ex2_ADirectorAndTheirTitlesInOneQuery()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d14/directors/2");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d14/directors/2 must answer 200 - reread README ex2.");

        var detail = await response.Content.ReadFromJsonAsync<DirectorDto>();
        Teach.Equal("Otto Reiner", detail?.Name, "Director 2 is Otto Reiner.");
        Teach.Equal("Long Meridian,Night Freight", string.Join(",", detail?.Titles ?? []),
            "His films oldest first: Long Meridian (2016), then Night Freight (2019).");
        Teach.Equal(1, host.Commands.Count,
            "One query for the name AND the titles: project the nested list inside the "
                + "Select. A second query means you fetched the director and then the "
                + "films.");

        host.Commands.Reset();
        var other = await client.GetFromJsonAsync<DirectorDto>("/d14/directors/1");
        Teach.Equal("Glass Harbor,Paper Sun", string.Join(",", other?.Titles ?? []),
            "Mira Vale: Glass Harbor (2021), Paper Sun (2023).");
        Teach.Equal(1, host.Commands.Count, "...still one query.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d14/directors/99"),
            "No director 99: 404.");
    }

    [Fact]
    public async Task Ex3_TheStatusComesOutOfTheDatabase()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d14/screenings/board");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d14/screenings/board must answer 200 - reread README ex3.");

        var rows = await response.Content.ReadFromJsonAsync<List<BoardRowDto>>();
        Teach.Equal("sold out,open,filling,open,sold out,filling,filling,open",
            string.Join(",", (rows ?? []).Select(r => r.Status)),
            "Screening 1 (120/120) is sold out; 3 (70/80) and 6 (170/200) and 7 (96/120) "
                + "are at 80% or more, so filling; the rest are open. Integer math: "
                + "sold*10 >= seats*8, no doubles.");
        Teach.Equal("Glass Harbor,Glass Harbor,Paper Sun,Paper Sun,Static Field,Static Field,Night Freight,Night Freight",
            string.Join(",", (rows ?? []).Select(r => r.Film)),
            "Each row names its film, id ascending.");
        Teach.Equal(1, host.Commands.Count,
            "One query, statuses included - the conditional lives in the projection.");

        string raw = await response.Content.ReadAsStringAsync();
        Teach.True(!raw.Contains("seats", StringComparison.OrdinalIgnoreCase),
            "The raw seat counts are not part of the board contract.\n  body: " + Truncate(raw));
    }

    [Fact]
    public async Task Ex4_FilmsWithNoScreeningsAtAll()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d14/films/quiet");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d14/films/quiet must answer 200 - reread README ex4.");

        var rows = await response.Content.ReadFromJsonAsync<List<QuietDto>>();
        Teach.Equal("Long Meridian:2016,Vinyl Country:2022",
            string.Join(",", (rows ?? []).Select(r => $"{r.Title}:{r.Year}")),
            "Exactly two films have no screenings. Every other film appearing here means "
                + "the absence test is inverted; missing one means it ran in memory over a "
                + "partial load.");
        Teach.Equal(1, host.Commands.Count,
            "One query: !f.Screenings.Any() translates to NOT EXISTS.");
    }

    [Fact]
    public async Task Ex5_TheEarliestScreeningInsideTheProjection()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d14/films/next-showing");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d14/films/next-showing must answer 200 - reread README ex5.");

        var rows = await response.Content.ReadFromJsonAsync<List<NextDto>>();
        Teach.Equal(
            "Glass Harbor:3:aurora,Long Meridian:-:-,Night Freight:1:rex,"
                + "Paper Sun:2:lumen,Static Field:2:lumen,Vinyl Country:-:-",
            string.Join(",", (rows ?? []).Select(r =>
                $"{r.Title}:{(r.NextDay?.ToString() ?? "-")}:{r.NextRoom ?? "-"}")),
            "Title A-Z, each with its earliest screening's day and room; Static Field's "
                + "two screenings tie on nothing (day 2 beats day 6), and films with no "
                + "screenings report null - they must still appear.");
        Teach.Equal(1, host.Commands.Count,
            "One query: the OrderBy...FirstOrDefault runs inside the Select, correlated "
                + "per film - not as a loop over films.");
    }

    [Fact]
    public async Task Ex6_NestedShapingWithAFilterInside()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d14/directors/slate");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d14/directors/slate must answer 200 - reread README ex6.");

        var slates = await response.Content.ReadFromJsonAsync<List<SlateDto>>();
        string shape = string.Join(";", (slates ?? []).Select(d =>
            d.Name + "=" + string.Join("|", (d.Films ?? []).Select(f =>
                f.Title + "[" + string.Join(",", f.OpenRooms ?? []) + "]"))));
        Teach.Equal(
            "Mira Vale=Glass Harbor[aurora]|Paper Sun[lumen,rex];"
                + "Otto Reiner=Long Meridian[]|Night Freight[aurora,rex];"
                + "Suki Anand=Static Field[rex]|Vinyl Country[]",
            shape,
            "Directors A-Z, films A-Z inside, and inside each film only the rooms with "
                + "sold < seats, A-Z. Glass Harbor's aurora day-3 show is full and must "
                + "not appear; Long Meridian and Vinyl Country keep their films with empty "
                + "room lists.");
        Teach.True(host.Commands.Count <= 2,
            $"The slate took {host.Commands.Count} queries; the budget is two. Shape the "
                + "whole thing in one projection instead of looping directors or films.");
    }

    [Fact]
    public async Task Ex7_SearchTwoShapesOneContract()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d14/search?q=er");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d14/search?q=er must answer 200 - reread README ex7.");

        var hits = await response.Content.ReadFromJsonAsync<List<HitDto>>();
        Teach.Equal(
            "film:Long Meridian:2016,film:Paper Sun:2023,director:Otto Reiner:-",
            string.Join(",", (hits ?? []).Select(h =>
                $"{h.Kind}:{h.Label}:{(h.Year?.ToString() ?? "-")}")),
            "\"er\" matches two film titles and one director name. Films first (title "
                + "A-Z, year filled), then directors (name A-Z, year null).");
        Teach.True(host.Commands.Count <= 2,
            $"The search took {host.Commands.Count} queries; two is the budget - one over "
                + "films, one over directors.");

        string raw = await response.Content.ReadAsStringAsync();
        Teach.True(!raw.Contains("email", StringComparison.OrdinalIgnoreCase)
                && !raw.Contains("budget", StringComparison.OrdinalIgnoreCase),
            "No internal columns in search results.\n  body: " + Truncate(raw));

        var upper = await client.GetFromJsonAsync<List<HitDto>>("/d14/search?q=VALE");
        Teach.Equal("director:Mira Vale", string.Join(",", (upper ?? []).Select(h => $"{h.Kind}:{h.Label}")),
            "The match is case-insensitive: VALE finds Mira Vale.");

        var blank = await client.GetAsync("/d14/search?q=%20");
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A blank q is 400.");
        var problem = await blank.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(problem?.Errors is not null && problem.Errors.ContainsKey("q"),
            "...as a validation problem whose errors dictionary is keyed \"q\".");
    }

    [Fact]
    public async Task Ex8_TheDashboardOnAQueryBudget()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d14/dashboard");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d14/dashboard must answer 200 - reread README ex8.");

        var dash = await response.Content.ReadFromJsonAsync<DashboardDto>();
        Teach.Equal(6, dash?.Films, "Six films exist.");
        Teach.Equal(8, dash?.Screenings, "Eight screenings exist.");
        Teach.Equal(646, dash?.SeatsSold,
            "120+60+70+40+80+170+96+10 tickets sold in total.");
        Teach.Equal(2, dash?.SoldOut,
            "Two screenings are full: Glass Harbor's day-3 show and Static Field's "
                + "day-2 show.");
        Teach.Equal("Static Field:89,Glass Harbor:75,Paper Sun:39",
            string.Join(",", (dash?.Top ?? []).Select(t => $"{t.Title}:{t.Percent}")),
            "Percent sold, integer division: Static Field 250*100/280 = 89, Glass Harbor "
                + "180*100/240 = 75, Paper Sun 110*100/280 = 39. Night Freight (33) just "
                + "misses the top three, and the two unscreened films are excluded.");

        Teach.True(host.Commands.Count <= 3,
            $"The dashboard took {host.Commands.Count} queries; three is the budget. "
                + "Aggregate in the database and fetch scalars, not tables.");
    }

    // ... private helpers and DTO records, listed below ...
}
```

...where the helpers are `NewHost` (a fresh in-memory SQLite database seeded
with three directors, six films and eight screenings) and `Truncate`, followed
by eleven `private sealed record` DTOs.
