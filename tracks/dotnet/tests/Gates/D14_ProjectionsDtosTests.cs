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

    private static SqliteHost<D14Db> NewHost() =>
        new SqliteHost<D14Db>().Seed(db =>
        {
            db.Directors.AddRange(
                new Director { Id = 1, Name = "Mira Vale", Email = "mira@studio.test" },
                new Director { Id = 2, Name = "Otto Reiner", Email = "otto@studio.test" },
                new Director { Id = 3, Name = "Suki Anand", Email = "suki@studio.test" });
            db.Films.AddRange(
                new Film { Id = 1, Title = "Glass Harbor", Year = 2021, Minutes = 104, BudgetCents = 900000000, DirectorId = 1 },
                new Film { Id = 2, Title = "Night Freight", Year = 2019, Minutes = 96, BudgetCents = 350000000, DirectorId = 2 },
                new Film { Id = 3, Title = "Paper Sun", Year = 2023, Minutes = 121, BudgetCents = 500000000, DirectorId = 1 },
                new Film { Id = 4, Title = "Static Field", Year = 2023, Minutes = 88, BudgetCents = 120000000, DirectorId = 3 },
                new Film { Id = 5, Title = "Long Meridian", Year = 2016, Minutes = 143, BudgetCents = 780000000, DirectorId = 2 },
                new Film { Id = 6, Title = "Vinyl Country", Year = 2022, Minutes = 99, BudgetCents = 220000000, DirectorId = 3 });
            db.Screenings.AddRange(
                new Screening { Id = 1, FilmId = 1, Room = "aurora", Day = 3, Seats = 120, Sold = 120 },
                new Screening { Id = 2, FilmId = 1, Room = "aurora", Day = 5, Seats = 120, Sold = 60 },
                new Screening { Id = 3, FilmId = 3, Room = "lumen", Day = 2, Seats = 80, Sold = 70 },
                new Screening { Id = 4, FilmId = 3, Room = "rex", Day = 4, Seats = 200, Sold = 40 },
                new Screening { Id = 5, FilmId = 4, Room = "lumen", Day = 2, Seats = 80, Sold = 80 },
                new Screening { Id = 6, FilmId = 4, Room = "rex", Day = 6, Seats = 200, Sold = 170 },
                new Screening { Id = 7, FilmId = 2, Room = "aurora", Day = 7, Seats = 120, Sold = 96 },
                new Screening { Id = 8, FilmId = 2, Room = "rex", Day = 1, Seats = 200, Sold = 10 });
        });

    private static string Truncate(string s) => s.Length <= 400 ? s : s[..400] + " ...";

    private sealed record CardDto(int Id, string? Title, int Year, string? Director);

    private sealed record DirectorDto(string? Name, List<string>? Titles);

    private sealed record BoardRowDto(int Id, string? Film, string? Room, string? Status);

    private sealed record QuietDto(string? Title, int Year);

    private sealed record NextDto(int Id, string? Title, int? NextDay, string? NextRoom);

    private sealed record SlateFilmDto(string? Title, List<string>? OpenRooms);

    private sealed record SlateDto(string? Name, List<SlateFilmDto>? Films);

    private sealed record HitDto(string? Kind, string? Label, int? Year);

    private sealed record ValidationDto(Dictionary<string, string[]>? Errors);

    private sealed record TopDto(string? Title, int Percent);

    private sealed record DashboardDto(int Films, int Screenings, int SeatsSold, int SoldOut, List<TopDto>? Top);
}
