# d11 — EF Core query drills

Eight problems on getting the right answer for the right number of round trips:
composing filters, projecting, grouping, aggregating, paging, killing an N+1,
split queries, and a search endpoint that does all of it on the database. They
drill lessons **05_efcore_basics** and **06_efcore_relationships**.

Everything is under `/d11/…` against `src/Api/D11_EfcoreQueries/Model.cs`:
students, courses, and the enrolments between them. Half the gates count SQL
commands, so "correct" is not enough on its own.

The seed: **students** Ada (GB), Grace (US), Linus (FI), Mia (US); **courses**
Algebra (math, 5), Calculus (math, 8), Poetry (arts, 3), Sculpture (arts, 4),
Rhetoric (arts, 2); **enrolments** 1–8, with scores 90, 75, 60, 88, 95, 66, 55,
100.

## Exercise 1 — filter, then sort

Edit `src/Api/D11_EfcoreQueries/Ex1.cs`. `GET /d11/students` → **200** with the
names, sorted A–Z. An optional `country` narrows them; a country nobody is from
is an **empty array**, not a 404.

```
uv run dojo test dotnet d11_efcore_queries ex1
```

## Exercise 2 — ask for the columns you need

Edit `src/Api/D11_EfcoreQueries/Ex2.cs`. `GET /d11/courses` → **200** with every
course as a `CourseSummary` — id, title, credits — sorted by title.

`subject` must not appear anywhere in the response.

```
uv run dojo test dotnet d11_efcore_queries ex2
```

## Exercise 3 — let the database do the arithmetic

Edit `src/Api/D11_EfcoreQueries/Ex3.cs`. `GET /d11/subjects` → **200** with one
row per subject — `{"subject": …, "courses": …, "totalCredits": …}` — sorted by
subject, in **one** SQL command.

```
uv run dojo test dotnet d11_efcore_queries ex3
```

## Exercise 4 — count and average without loading

Edit `src/Api/D11_EfcoreQueries/Ex4.cs`.
`GET /d11/courses/{id:int}/stats` → **200** with
`{"title": …, "enrolled": …, "averageScore": …}`, **404** when there is no such
course.

The average is a whole number, and a course nobody is enrolled on averages
**0** — not an exception.

```
uv run dojo test dotnet d11_efcore_queries ex4
```

## Exercise 5 — a page and its total

Edit `src/Api/D11_EfcoreQueries/Ex5.cs`. `GET /d11/enrolments` → **200** with
`{"items": [{"id": …, "score": …}], "total": …, "page": …, "size": …}`, id
ascending.

`page` is 1-based, default 1; `size` defaults to 3 and may not exceed 50;
anything else is a **400**. It costs **exactly two** SQL commands, however big
the table is.

```
uv run dojo test dotnet d11_efcore_queries ex5
```

## Exercise 6 — the N+1

Edit `src/Api/D11_EfcoreQueries/Ex6.cs`.
`GET /d11/enrolments/overview` already returns the right rows —
`{"enrolmentId": …, "student": …, "course": …, "score": …}`, id ascending — and
takes seventeen SQL commands to do it.

Make it **one**, without changing the output.

```
uv run dojo test dotnet d11_efcore_queries ex6
```

## Exercise 7 — one query, or one per collection

Edit `src/Api/D11_EfcoreQueries/Ex7.cs`.
`GET /d11/students/{id:int}/detail` → **200** with
`{"name": …, "courses": [titles sorted A–Z]}`, **404** when there is no such
student.

The same load, two ways: `split=false` (the default) must cost **one** SQL
command and `split=true` must cost **two**. Use `Include`/`ThenInclude` rather
than a projection, so the difference is visible.

```
uv run dojo test dotnet d11_efcore_queries ex7
```

## Exercise 8 — compose the query, then run it once

Edit `src/Api/D11_EfcoreQueries/Ex8.cs`. `GET /d11/search` → **200** with
`{"items": [{"student": …, "course": …, "score": …}], "total": …}`, where
`total` is how many **matched**:

- `subject` — optional, matches the course's subject
- `minScore` — optional, keeps scores at or above it
- `sort` — `score` (highest first, the default), `student` or `course` (A–Z);
  anything else is a **400**
- `page` — 1-based, default 1; `size` — default 3, maximum 20

Ties break by enrolment id so paging is stable, and the whole thing costs **two**
SQL commands whatever the parameters.

```
uv run dojo test dotnet d11_efcore_queries ex8
```

## The gate

This is the entire gate class, `tests/Gates/D11_EfcoreQueriesTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.D11_EfcoreQueries;

namespace DotnetDojo.Gates;

public class D11_EfcoreQueriesTests
{
    [Fact]
    public async Task Ex1_TheFilterJoinsTheQueryRatherThanTheAnswer()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var all = await client.GetAsync("/d11/students");
        await Teach.Status(HttpStatusCode.OK, all,
            "GET /d11/students must answer 200 - reread README ex1.");
        Teach.Equal("Ada,Grace,Linus,Mia", await Names(all),
            "No country means everyone, sorted A-Z.");

        Teach.Equal("Grace,Mia", await Names(await client.GetAsync("/d11/students?country=US")),
            "Two of the four are in the US.");

        var nobody = await client.GetAsync("/d11/students?country=XX");
        await Teach.Status(HttpStatusCode.OK, nobody,
            "A country nobody is from is a 200 with an empty array - the collection exists and "
                + "is empty.");
        Teach.Equal("", await Names(nobody), "…with nothing in it.");
    }

    [Fact]
    public async Task Ex2_TheProjectionDecidesWhichColumnsAreFetched()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d11/courses");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d11/courses must answer 200 - reread README ex2.");

        var courses = await response.Content.ReadFromJsonAsync<List<SummaryDto>>() ?? [];
        Teach.Equal("Algebra,Calculus,Poetry,Rhetoric,Sculpture",
            string.Join(",", courses.Select(c => c.Title)),
            "Five courses, sorted by title.");
        Teach.Equal("1,2,3,5,4", string.Join(",", courses.Select(c => c.Id)),
            "…and each carries its own id, so the sort really is by title and not by id.");

        string raw = await client.GetStringAsync("/d11/courses");
        Teach.True(!raw.Contains("subject", StringComparison.OrdinalIgnoreCase),
            "A CourseSummary has no subject. Seeing it means whole entities were materialised "
                + "and the projection happened afterwards, in memory - which fetches every "
                + "column of every row.\n  body: " + raw);
    }

    [Fact]
    public async Task Ex3_TheDatabaseGroupsAndSums()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d11/subjects");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d11/subjects must answer 200 - reread README ex3.");

        var subjects = await response.Content.ReadFromJsonAsync<List<SubjectDto>>() ?? [];
        Teach.Equal("arts,math", string.Join(",", subjects.Select(s => s.Subject)),
            "Two subjects, sorted A-Z.");
        Teach.Equal("3,2", string.Join(",", subjects.Select(s => s.Courses)),
            "Three arts courses - Poetry, Sculpture, Rhetoric - and two maths.");
        Teach.Equal("9,13", string.Join(",", subjects.Select(s => s.TotalCredits)),
            "Arts credits are 3 + 4 + 2; maths are 5 + 8.");

        Teach.True(commands == 1,
            $"It took {commands} SQL commands. GroupBy over an IQueryable becomes GROUP BY and "
                + "two rows come back; GroupBy after ToListAsync fetches every course and does "
                + "the arithmetic in your process, which is the same answer and the whole "
                + "table.");
    }

    [Fact]
    public async Task Ex4_CountingAndAveragingWithoutMaterialising()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var algebra = await client.GetAsync("/d11/courses/1/stats");
        await Teach.Status(HttpStatusCode.OK, algebra,
            "GET /d11/courses/1/stats must answer 200 - reread README ex4.");

        var stats = await algebra.Content.ReadFromJsonAsync<StatsDto>();
        Teach.Equal("Algebra", stats?.Title, "Course 1 is Algebra.");
        Teach.Equal(3, stats?.Enrolled, "Three students are on it.");
        Teach.Equal(72, stats?.AverageScore, "Their scores are 90, 60 and 66, so the mean is 72.");

        var calculus = await client.GetFromJsonAsync<StatsDto>("/d11/courses/2/stats");
        Teach.Equal(85, calculus?.AverageScore, "Calculus has 75 and 95.");

        var empty = await client.GetAsync("/d11/courses/5/stats");
        await Teach.Status(HttpStatusCode.OK, empty,
            "Rhetoric exists and nobody is enrolled, which is a 200. A 500 here is "
                + "InvalidOperationException from averaging an empty sequence - the fix is to "
                + "average an int? so the database's NULL comes back as null rather than "
                + "throwing.");
        var emptyStats = await empty.Content.ReadFromJsonAsync<StatsDto>();
        Teach.Equal(0, emptyStats?.Enrolled, "…nobody is on it…");
        Teach.Equal(0, emptyStats?.AverageScore, "…and its average is 0.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d11/courses/99/stats"),
            "There is no course 99: 404.");
    }

    [Fact]
    public async Task Ex5_APageAndItsTotalCostTwoQueries()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d11/enrolments?page=2&size=3");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d11/enrolments?page=2&size=3 must answer 200 - reread README ex5.");

        var page = await response.Content.ReadFromJsonAsync<PageDto>();
        Teach.Equal("4,5,6", string.Join(",", (page?.Items ?? []).Select(i => i.Id)),
            "Eight enrolments, id ascending; page 2 of size 3 is 4, 5 and 6. Skip before Take, "
                + "and order before both.");
        Teach.Equal(8, page?.Total,
            "total is how many rows exist, not how many came back - that is what lets a client "
                + "draw the page numbers.");
        Teach.Equal(2, page?.Page, "Echo the page you served…");
        Teach.Equal(3, page?.Size, "…and the size.");

        Teach.True(commands == 2,
            $"It took {commands} SQL commands. A page and a count are two queries - one COUNT "
                + "and one SELECT with LIMIT. More than two means something was materialised "
                + "and counted in memory, which fetches the whole table to answer \"how many\".");

        var defaults = await client.GetFromJsonAsync<PageDto>("/d11/enrolments");
        Teach.Equal("1,2,3", string.Join(",", (defaults?.Items ?? []).Select(i => i.Id)),
            "With no query string, page 1 of size 3.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.GetAsync("/d11/enrolments?page=0"), "Pages are 1-based.");
        await Teach.Status(HttpStatusCode.BadRequest,
            await client.GetAsync("/d11/enrolments?size=51"),
            "An unbounded page size is how one client takes the database down.");
    }

    [Fact]
    public async Task Ex6_TheOverviewBecomesOneQuery()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d11/enrolments/overview");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d11/enrolments/overview must answer 200 - reread README ex6.");

        var rows = await response.Content.ReadFromJsonAsync<List<OverviewDto>>() ?? [];
        Teach.Equal("1,2,3,4,5,6,7,8", string.Join(",", rows.Select(r => r.EnrolmentId)),
            "One row per enrolment, id ascending.");
        Teach.Equal("Ada,Ada,Grace,Grace,Linus,Mia,Mia,Ada",
            string.Join(",", rows.Select(r => r.Student)),
            "…each with the name of the student who enrolled.");
        Teach.Equal("Algebra,Calculus,Algebra,Poetry,Calculus,Algebra,Sculpture,Poetry",
            string.Join(",", rows.Select(r => r.Course)),
            "…and the title of the course.");

        Teach.True(commands == 1,
            $"{commands} SQL commands for eight rows. That is the N+1: one query for the "
                + "enrolments, then two more for every one of them. Every enrolment is one "
                + "join away from its student and its course - say so in the projection and "
                + "the database does it once, whatever the number of rows.");
    }

    [Fact]
    public async Task Ex7_SplitQueryTradesOneRoundTripForNarrowerRows()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var single = await client.GetAsync("/d11/students/1/detail");
        int singleCommands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, single,
            "GET /d11/students/1/detail must answer 200 - reread README ex7.");

        var detail = await single.Content.ReadFromJsonAsync<DetailDto>();
        Teach.Equal("Ada", detail?.Name, "Student 1 is Ada.");
        Teach.Equal("Algebra,Calculus,Poetry", string.Join(",", detail?.Courses ?? []),
            "…and she is on three courses, sorted A-Z. An empty list means the navigation was "
                + "never populated: EF does not load related data unless you ask.");

        Teach.True(singleCommands == 1,
            $"The default took {singleCommands} SQL commands. One Include plus one ThenInclude "
                + "is a single JOIN unless you say otherwise.");

        host.Commands.Reset();
        var split = await client.GetAsync("/d11/students/1/detail?split=true");
        int splitCommands = host.Commands.Count;

        var splitDetail = await split.Content.ReadFromJsonAsync<DetailDto>();
        Teach.Equal("Algebra,Calculus,Poetry", string.Join(",", splitDetail?.Courses ?? []),
            "The answer is identical either way.");
        Teach.True(splitCommands == 2,
            $"…but split=true took {splitCommands} commands instead of 2. AsSplitQuery sends "
                + "one query per collection, which is how you avoid the cartesian explosion "
                + "when a root row has two collections and JOINing them multiplies the rows "
                + "together.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.GetAsync("/d11/students/99/detail"), "There is no student 99: 404.");
    }

    [Fact]
    public async Task Ex8_EveryPartOfTheSearchHappensOnTheDatabase()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d11/search?subject=math");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d11/search?subject=math must answer 200 - reread README ex8.");

        var page = await response.Content.ReadFromJsonAsync<SearchDto>();
        Teach.Equal(5, page?.Total,
            "Five enrolments are on maths courses - and the total counts the MATCHES, not the "
                + "page.");
        Teach.Equal("Linus|Calculus|95,Ada|Algebra|90,Ada|Calculus|75", Rows(page),
            "Default sort is highest score first, and the default page is 1 of size 3.");

        Teach.True(commands == 2,
            $"It took {commands} SQL commands - one count and one page. More means the filter, "
                + "the sort or the paging happened in memory, which fetches rows the client "
                + "will never see.");

        var filtered = await client.GetFromJsonAsync<SearchDto>(
            "/d11/search?subject=math&minScore=70");
        Teach.Equal(3, filtered?.Total, "Three of those five scored 70 or better.");
        Teach.Equal("Linus|Calculus|95,Ada|Algebra|90,Ada|Calculus|75", Rows(filtered),
            "…and both filters applied together.");

        var byStudent = await client.GetFromJsonAsync<SearchDto>(
            "/d11/search?subject=math&sort=student&size=5");
        Teach.Equal("Ada|Algebra|90,Ada|Calculus|75,Grace|Algebra|60,Linus|Calculus|95,Mia|Algebra|66",
            Rows(byStudent),
            "sort=student is A-Z, and Ada's two rows are broken by enrolment id - an ORDER BY "
                + "with ties is an ordering that can change between runs, and a paged endpoint "
                + "with an unstable sort shows a client the same row twice.");

        var page2 = await client.GetFromJsonAsync<SearchDto>(
            "/d11/search?subject=math&sort=course&page=2&size=2");
        Teach.Equal("Mia|Algebra|66,Ada|Calculus|75", Rows(page2),
            "By course title the order is Algebra 90, Algebra 60, Algebra 66, Calculus 75, "
                + "Calculus 95 - so page 2 of size 2 is the third and fourth.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.GetAsync("/d11/search?sort=sideways"),
            "\"sideways\" is not a sort. A whitelist keeps your column names out of the API "
                + "surface and every supported sort indexable.");
        await Teach.Status(HttpStatusCode.BadRequest,
            await client.GetAsync("/d11/search?size=21"), "The size cap is 20.");
    }

    // … private helpers and DTO records, listed below …
}
```

…where the helpers are `NewHost` (a `SqliteHost<D11Db>` with the seed above),
`Names` and `Rows`, plus nine `private sealed record` DTOs.
