# d10 — EF Core CRUD drills

Eight problems on reading and writing rows: projection, lookups by key and by
another column, create, update, delete, a set-based update that loads nothing,
the unit of work, PUT-as-upsert, and an all-or-nothing batch. They drill lesson
**05_efcore_basics** — go back to it if `SaveChangesAsync` still feels like
magic.

Everything is under `/d10/…` against `src/Api/D10_EfcoreCrud/Model.cs`: one
`Member` entity, one `D10Db`. The gates give each test a private in-memory
SQLite database seeded with five members — Ada 120 (black), Grace 80 (brown),
Linus 200 (black), Mia 80 (white), Noor 45 (brown).

## Exercise 1 — project, then order

Edit `src/Api/D10_EfcoreCrud/Ex1.cs`. `GET /d10/members` → **200** with every
member as a `MemberSummary` — id, name and credits only — most credits first,
ties broken by name A–Z.

The gate reads the raw body: `email` or `grade` appearing anywhere means whole
entities went over the wire.

```
uv run dojo test dotnet d10_efcore_crud ex1
```

## Exercise 2 — by key, and by another column

Edit `src/Api/D10_EfcoreCrud/Ex2.cs`.

- `GET /d10/members/{id:int}` — **200** with the whole row, **404** otherwise
- `GET /d10/members/by-email/{email}` — the same, matching on a column that is
  not the primary key

```
uv run dojo test dotnet d10_efcore_crud ex2
```

## Exercise 3 — create

Edit `src/Api/D10_EfcoreCrud/Ex3.cs`. `POST /d10/members` with
`{"name": …, "email": …, "credits": …}` → **201** with
`Location: /d10/members/{id}` and the created member, at grade `white`.

A blank name, a blank email or negative credits is a **400** that writes
nothing.

```
uv run dojo test dotnet d10_efcore_crud ex3
```

## Exercise 4 — update and delete

Edit `src/Api/D10_EfcoreCrud/Ex4.cs`.

- `PUT /d10/members/{id:int}/credits` with `{"credits": …}` — **204** when it
  stuck, **404** when there is no such member, **400** for negative credits
  (writing nothing)
- `DELETE /d10/members/{id:int}` — **204** when the row is now gone, **404**
  when it was not there

```
uv run dojo test dotnet d10_efcore_crud ex4
```

## Exercise 5 — change many rows without loading any

Edit `src/Api/D10_EfcoreCrud/Ex5.cs`.
`POST /d10/members/regrade?from=…&to=…` → **200** with `{"changed": …}`, the
number of rows that moved from one grade to the other.

Both parameters are required (**400** otherwise), and it must cost the database
**exactly one command** however many rows match.

```
uv run dojo test dotnet d10_efcore_crud ex5
```

## Exercise 6 — two rows, one save

Edit `src/Api/D10_EfcoreCrud/Ex6.cs`. `POST /d10/transfer` with
`{"from": …, "to": …, "credits": …}` moves credits between two members and
answers **200** with `{"changed": …}` taken from `SaveChangesAsync` itself.

**404** when either member is missing; **400** when the amount is not positive
or the sender cannot afford it — and a refused transfer leaves both rows exactly
as they were.

```
uv run dojo test dotnet d10_efcore_crud ex6
```

## Exercise 7 — PUT as upsert

Edit `src/Api/D10_EfcoreCrud/Ex7.cs`. `PUT /d10/roster/{email}` with
`{"name": …, "credits": …}`:

- nobody has that email → **201**, `Location: /d10/members/{id}`, the member, at
  grade `white`
- somebody does → **204**, and their name and credits are replaced
- blank name or negative credits → **400**, writing nothing

```
uv run dojo test dotnet d10_efcore_crud ex7
```

## Exercise 8 — the whole batch or none of it

Edit `src/Api/D10_EfcoreCrud/Ex8.cs`. `POST /d10/members/batch` with an array of
new members → **201** with `{"created": [ids]}` in request order and a
`Location` naming the first.

If **any** item is invalid — blank name, blank email, negative credits, or an
email that is already taken, *including by an earlier item in the same batch* —
the whole request is a **400** with `{"index": …, "message": …}` for the first
bad one, and not a single row is written.

```
uv run dojo test dotnet d10_efcore_crud ex8
```

## The gate

This is the entire gate class, `tests/Gates/D10_EfcoreCrudTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.D10_EfcoreCrud;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Gates;

public class D10_EfcoreCrudTests
{
    [Fact]
    public async Task Ex1_TheListIsProjectedAndSorted()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d10/members");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d10/members must answer 200 - reread README ex1.");

        Teach.Equal("3,1,2,4,5", await Ids(response),
            "Most credits first - Linus 200, Ada 120 - and the two on 80 broken by name, so "
                + "Grace before Mia. Getting 1,2,3,4,5 means you never ordered: the order rows "
                + "come back in is not a promise the database makes.");

        string raw = await client.GetStringAsync("/d10/members");
        Teach.True(!raw.Contains("email", StringComparison.OrdinalIgnoreCase),
            "The list is a MemberSummary - id, name and credits. \"email\" in the body means "
                + "whole entities went over the wire, columns nobody asked for included.\n"
                + "  body: " + raw);
        Teach.True(!raw.Contains("grade", StringComparison.OrdinalIgnoreCase),
            "…and so does \"grade\". Select before ToListAsync and the database stops fetching "
                + "them at all.");
    }

    [Fact]
    public async Task Ex2_ByKeyAndByAnotherColumn()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var found = await client.GetAsync("/d10/members/3");
        await Teach.Status(HttpStatusCode.OK, found,
            "GET /d10/members/3 must answer 200 - reread README ex2.");

        var member = await found.Content.ReadFromJsonAsync<MemberDto>();
        Teach.Equal("Linus", member?.Name, "Member 3 is Linus.");
        Teach.Equal("black", member?.Grade,
            "This endpoint returns the whole row, grade and email included - unlike ex1's list.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d10/members/99"),
            "There is no member 99. FirstOrDefaultAsync and FindAsync both give you null for "
                + "that; First would throw, and a thrown exception is a 500.");

        var byEmail = await client.GetAsync("/d10/members/by-email/mia@dojo.test");
        await Teach.Status(HttpStatusCode.OK, byEmail,
            "GET /d10/members/by-email/mia@dojo.test must answer 200.");
        Teach.Equal(4, (await byEmail.Content.ReadFromJsonAsync<MemberDto>())?.Id,
            "Mia is member 4. Email is not the key, so FindAsync cannot do this one - it only "
                + "looks up primary keys.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.GetAsync("/d10/members/by-email/nobody@dojo.test"),
            "Nobody has that email: 404.");
    }

    [Fact]
    public async Task Ex3_TheDatabaseGivesTheNewRowItsId()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var created = await client.PostAsJsonAsync("/d10/members",
            new { name = "Zoe", email = "zoe@dojo.test", credits = 10 });
        await Teach.Status(HttpStatusCode.Created, created,
            "A successful POST is 201 - reread README ex3.");
        Teach.Equal("/d10/members/6", created.Headers.Location?.ToString(),
            "Five members are seeded, so the new one is 6 - and you only know that after "
                + "SaveChangesAsync, because the database generates it.");

        var member = await created.Content.ReadFromJsonAsync<MemberDto>();
        Teach.Equal(6, member?.Id, "The body is the created member, with its real id.");
        Teach.Equal("white", member?.Grade, "A new member starts at white.");

        Teach.Equal(6, host.Query(db => db.Members.Count()), "…and the table holds six rows.");

        await Teach.Status(HttpStatusCode.BadRequest, await client.PostAsJsonAsync("/d10/members",
            new { name = "  ", email = "blank@dojo.test", credits = 1 }),
            "A blank name is a 400.");
        await Teach.Status(HttpStatusCode.BadRequest, await client.PostAsJsonAsync("/d10/members",
            new { name = "Nameless", email = "", credits = 1 }),
            "…and so is a blank email.");
        await Teach.Status(HttpStatusCode.BadRequest, await client.PostAsJsonAsync("/d10/members",
            new { name = "Owing", email = "owing@dojo.test", credits = -1 }),
            "…and negative credits.");

        Teach.Equal(6, host.Query(db => db.Members.Count()),
            "Three rejected requests must not have inserted anything. Validate before Add.");
    }

    [Fact]
    public async Task Ex4_AssignAndSaveIsTheWholeUpdate()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var updated = await client.PutAsJsonAsync("/d10/members/2/credits", new { credits = 95 });
        await Teach.Status(HttpStatusCode.NoContent, updated,
            "A successful update has nothing to say: 204 - reread README ex4.");
        Teach.Equal(95, host.Query(db => db.Members.Single(m => m.Id == 2).Credits),
            "…and the row really changed. You do not call Update: the change tracker noticed "
                + "the assignment, and SaveChangesAsync wrote it.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PutAsJsonAsync("/d10/members/99/credits", new { credits = 1 }),
            "There is no member 99: 404.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PutAsJsonAsync("/d10/members/2/credits", new { credits = -5 }),
            "Negative credits is a 400.");
        Teach.Equal(95, host.Query(db => db.Members.Single(m => m.Id == 2).Credits),
            "…and the rejected request must not have written anything.");

        var deleted = await client.DeleteAsync("/d10/members/5");
        await Teach.Status(HttpStatusCode.NoContent, deleted, "A successful DELETE is 204.");
        Teach.Equal(4, host.Query(db => db.Members.Count()),
            "…and the row is gone from the table, not just from the response.");

        await Teach.Status(HttpStatusCode.NotFound, await client.DeleteAsync("/d10/members/5"),
            "Deleting it again is a 404: you cannot remove an entity you did not load.");
    }

    [Fact]
    public async Task Ex5_ManyRowsChangeWithoutBeingLoaded()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.PostAsync("/d10/members/regrade?from=brown&to=blue", null);
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "POST /d10/members/regrade must answer 200 - reread README ex5.");
        Teach.Equal(2, (await response.Content.ReadFromJsonAsync<ChangeDto>())?.Changed,
            "Grace and Noor are the two browns.");
        Teach.Equal(2, host.Query(db => db.Members.Count(m => m.Grade == "blue")),
            "…and both of them are blue now.");

        Teach.True(commands == 1,
            $"It took {commands} SQL commands. Loading the rows, changing them in memory and "
                + "saving is a SELECT plus an UPDATE per row - fine for three rows, ruinous "
                + "for thirty thousand. ExecuteUpdateAsync sends one UPDATE ... WHERE and "
                + "never materialises an entity.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PostAsync("/d10/members/regrade?from=brown", null),
            "Both grades are required: a regrade with no target is a 400, not a silent no-op.");
    }

    [Fact]
    public async Task Ex6_TwoRowsMoveInOneSave()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var moved = await client.PostAsJsonAsync("/d10/transfer",
            new { from = 1, to = 5, credits = 20 });
        await Teach.Status(HttpStatusCode.OK, moved,
            "POST /d10/transfer must answer 200 - reread README ex6.");
        Teach.Equal(2, (await moved.Content.ReadFromJsonAsync<ChangeDto>())?.Changed,
            "SaveChangesAsync returns how many rows it touched, and this touched two. A 1 "
                + "means only one side of the transfer was changed; a 0 means nothing was.");

        Teach.Equal(100, host.Query(db => db.Members.Single(m => m.Id == 1).Credits),
            "Ada had 120 and sent 20.");
        Teach.Equal(65, host.Query(db => db.Members.Single(m => m.Id == 5).Credits),
            "…and Noor had 45 and received them.");

        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsJsonAsync("/d10/transfer",
            new { from = 1, to = 99, credits = 5 }),
            "There is no member 99, so there is nowhere to send it: 404.");

        await Teach.Status(HttpStatusCode.BadRequest, await client.PostAsJsonAsync("/d10/transfer",
            new { from = 5, to = 1, credits = 1000 }),
            "Noor cannot send a thousand credits she does not have: 400.");
        Teach.Equal(65, host.Query(db => db.Members.Single(m => m.Id == 5).Credits),
            "…and a refused transfer must leave both rows exactly as they were. Check the "
                + "balance BEFORE you touch either entity - once you have assigned to one of "
                + "them, a later return leaves the change tracker holding an edit you did not "
                + "mean.");

        await Teach.Status(HttpStatusCode.BadRequest, await client.PostAsJsonAsync("/d10/transfer",
            new { from = 1, to = 5, credits = 0 }),
            "Transferring nothing is a 400.");
    }

    [Fact]
    public async Task Ex7_PutCreatesOnceAndThenReplaces()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var created = await client.PutAsJsonAsync("/d10/roster/zoe@dojo.test",
            new { name = "Zoe", credits = 10 });
        await Teach.Status(HttpStatusCode.Created, created,
            "Nobody has that email, so this PUT created a member: 201 - reread README ex7.");
        Teach.Equal("/d10/members/6", created.Headers.Location?.ToString(),
            "…with a Location naming what it made.");
        Teach.Equal(6, host.Query(db => db.Members.Count()), "…and there are six members now.");

        var replaced = await client.PutAsJsonAsync("/d10/roster/ada@dojo.test",
            new { name = "Ada L", credits = 130 });
        await Teach.Status(HttpStatusCode.NoContent, replaced,
            "Ada already exists, so the same request shape replaced her: 204. This is the "
                + "branch that makes PUT-as-upsert worth writing - the client names the "
                + "resource, so it can create it without a server-generated id.");
        Teach.Equal(6, host.Query(db => db.Members.Count()),
            "…and nothing new was created.");
        Teach.Equal("Ada L", host.Query(db => db.Members.Single(m => m.Id == 1).Name),
            "…her name was replaced…");
        Teach.Equal(130, host.Query(db => db.Members.Single(m => m.Id == 1).Credits),
            "…and so were her credits.");

        var again = await client.PutAsJsonAsync("/d10/roster/ada@dojo.test",
            new { name = "Ada L", credits = 130 });
        await Teach.Status(HttpStatusCode.NoContent, again,
            "The identical request again is still 204. That is idempotency: the end state is "
                + "what the client asked for, so it succeeded.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PutAsJsonAsync("/d10/roster/blank@dojo.test",
                new { name = "  ", credits = 1 }),
            "A blank name is a 400.");
        Teach.Equal(6, host.Query(db => db.Members.Count()), "…and it created nothing.");
    }

    [Fact]
    public async Task Ex8_TheWholeBatchOrNoneOfIt()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var created = await client.PostAsJsonAsync("/d10/members/batch", new[]
        {
            new { name = "Zoe", email = "zoe@dojo.test", credits = 10 },
            new { name = "Yan", email = "yan@dojo.test", credits = 20 },
        });
        await Teach.Status(HttpStatusCode.Created, created,
            "A successful batch is 201 - reread README ex8.");
        Teach.Equal("6,7", string.Join(",",
            (await created.Content.ReadFromJsonAsync<BatchDto>())?.Created ?? []),
            "Two new members, in request order, with the ids the database gave them.");
        Teach.Equal(7, host.Query(db => db.Members.Count()), "…and the table holds seven rows.");

        var blank = await client.PostAsJsonAsync("/d10/members/batch", new[]
        {
            new { name = "Ann", email = "ann@dojo.test", credits = 5 },
            new { name = "", email = "bad@dojo.test", credits = 5 },
        });
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "The second item has no name, so the whole batch is refused.");
        var error = await blank.Content.ReadFromJsonAsync<ErrorDto>();
        Teach.Equal(1, error?.Index,
            "…and the error says WHICH item, because \"one of your 500 rows is wrong\" is not "
                + "an error message anybody can act on.");
        Teach.Equal(7, host.Query(db => db.Members.Count()),
            "Crucially, Ann was NOT created. Validate the whole batch before adding anything - "
                + "adding as you go and returning early leaves the good half of a bad request "
                + "in the change tracker, and one stray SaveChanges writes it.");

        var duplicate = await client.PostAsJsonAsync("/d10/members/batch", new[]
        {
            new { name = "Bo", email = "bo@dojo.test", credits = 5 },
            new { name = "Cy", email = "ada@dojo.test", credits = 5 },
        });
        await Teach.Status(HttpStatusCode.BadRequest, duplicate,
            "Ada already has that email.");
        Teach.Equal(1, (await duplicate.Content.ReadFromJsonAsync<ErrorDto>())?.Index,
            "…and it is the second item that is wrong.");
        Teach.Equal(7, host.Query(db => db.Members.Count()), "…and Bo was not created either.");

        var withinBatch = await client.PostAsJsonAsync("/d10/members/batch", new[]
        {
            new { name = "Dee", email = "dee@dojo.test", credits = 5 },
            new { name = "Dot", email = "dee@dojo.test", credits = 5 },
        });
        await Teach.Status(HttpStatusCode.BadRequest, withinBatch,
            "Both items claim the same email. Neither of them is in the database yet, so a "
                + "check that only looks at existing rows misses this one - the batch has to "
                + "be checked against itself as well.");
        Teach.Equal(7, host.Query(db => db.Members.Count()), "…and nothing was written.");
    }

    // … private helpers and DTO records, listed below …
}
```

…where the helpers are `NewHost` (a `SqliteHost<D10Db>` with the five seeded
members) and `Ids`, plus five `private sealed record` DTOs.
