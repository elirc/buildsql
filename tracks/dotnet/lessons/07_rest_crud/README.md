# 07 — A real resource: DTOs, validation, status codes

You have written every piece of this before, in fragments. Lesson 01 gave you
201 and `Location`; lesson 05 gave you `Add` and `SaveChangesAsync`; lesson 06
gave you projection. This lesson puts them together into the thing a team
actually ships: **one resource, with a complete lifecycle**, that a client can
learn once and use everywhere.

Two ideas run through all of it, and both are about boundaries.

The first is **DTOs versus entities**. `Widget` is a row in a table. It has an
`InternalNotes` column your operations team writes in, and a `Revision` counter
your persistence layer maintains. Neither is any of a client's business — and if
you serialise the entity, both go over the wire, forever, to everyone. Worse: if
you *bind* the entity from a request body, a client can set them. `WidgetDto`,
`CreateWidget` and `UpdateWidget` exist so that the set of fields leaving your
process and the set of fields entering it are both written down and both small.

The second is that **a status code is an answer to a question**, and REST gives
you a small vocabulary of very precise ones. By the end of this lesson your
widget resource answers 200, 201, 204, 400, 404 and 409, and each of them for
exactly one reason.

Read `src/Api/L07_RestCrud/Model.cs` first — it is given code, and the
comments in it are half the lesson.

## Concept — the resource, and the shape of its answers

A resource is a noun with a URL, and the HTTP method is the verb:

| request | meaning | success | failures |
|---|---|---|---|
| `GET /widgets` | the collection | 200 + array | — |
| `GET /widgets/3` | one member | 200 + object | 404 |
| `POST /widgets` | make a new member | 201 + `Location` + object | 400, 409 |
| `PUT /widgets/3` | replace that member | 204 | 400, 404, 409 |
| `DELETE /widgets/3` | remove that member | 204 | 404 |

`PUT` is worth pausing on because it is the one people get wrong. It means
*replace the resource at this URL with this representation* — so it takes the
whole thing, not a patch, and it is **idempotent**: sending it ten times leaves
the world exactly as sending it once did. `POST` is not idempotent; ten POSTs
make ten widgets. If you want partial updates, that is `PATCH`, and it is a
different endpoint with different semantics.

### ProblemDetails: the standard shape for "no"

RFC 9457 defines a JSON document for errors, and ASP.NET Core speaks it out of
the box:

```csharp
return TypedResults.ValidationProblem(new Dictionary<string, string[]>
{
    ["name"] = ["Name is required."],
    ["priceCents"] = ["PriceCents must be greater than zero."],
});
```

…produces `400` with `Content-Type: application/problem+json` and a body of:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "name": ["Name is required."],
    "priceCents": ["PriceCents must be greater than zero."]
  }
}
```

For a non-validation failure, `TypedResults.Problem(title:, detail:, statusCode:)`
gives you the same document without the `errors` object.

Why bother, when a string would do? Because every client, generated SDK, logging
pipeline and API gateway in the ecosystem knows this shape. A caller can render
your field errors next to the right form inputs without you and them agreeing on
anything first. Inventing your own error envelope is a decision you make once and
regret for years.

### Validate everything, at once

Collect all the problems and return them together. A 400 that names only the
first broken field makes the client fix its request one round trip at a time,
which is miserable to use and looks careless.

## Exercise 1 — read, without leaking

Edit `src/Api/L07_RestCrud/Ex1.cs`. Two handlers:

- `GET /l07/widgets` → **200** with every widget as a `WidgetDto`, name
  ascending
- `GET /l07/widgets/{id}` → **200** with one `WidgetDto`, or **404**

The gate reads the raw response text and fails if the strings `internalNotes` or
`revision` appear anywhere in it. Projecting into the DTO inside the query — as
in lesson 06 — solves the leak and the over-fetch at the same time.

```
uv run dojo test dotnet 07_rest_crud ex1
```

## Exercise 2 — create, validate, refuse

Edit `src/Api/L07_RestCrud/Ex2.cs`. `POST /l07/widgets` takes a `CreateWidget`
and answers:

- **201** with a `Location` of `/l07/widgets/{new id}` and the created
  `WidgetDto` as the body
- **400**, as a validation problem, when the name is blank, the sku is blank, or
  `priceCents` is not positive — with one entry in `errors` per broken field,
  keyed `"name"`, `"sku"` and `"priceCents"`. All of them at once.
- **409** when another widget already has that sku

400 versus 409 is the judgement here. A blank name is *malformed input*: the
client can look at its own request and see the problem. A duplicate sku is a
well-formed request that conflicts with the *current state of the collection* —
the client could not have known, and the same request might succeed tomorrow.
That is what 409 means.

```
uv run dojo test dotnet 07_rest_crud ex2
```

## Exercise 3 — replace, idempotently

Edit `src/Api/L07_RestCrud/Ex3.cs`. `PUT /l07/widgets/{id}` takes an
`UpdateWidget` and answers **404** for an unknown id, **400** for the same three
validation rules as ex2, and **204** otherwise.

Two things the gate insists on beyond the status codes.

The same request sent twice must be **204 both times**, with no second widget
and no error. That is idempotency, and it is what lets a client retry safely
after a timeout.

And `InternalNotes` on the row must be **unchanged**. The request body has no
such field, so the only way to break this is to overwrite the whole entity
instead of assigning the three fields you accept. That mistake has a name —
*mass assignment* — and it is how "user updates their profile" turns into "user
sets their own `IsAdmin`".

```
uv run dojo test dotnet 07_rest_crud ex3
```

## Exercise 4 — delete, once

Edit `src/Api/L07_RestCrud/Ex4.cs`. `DELETE /l07/widgets/{id}` answers **204**
when the widget was there and is now gone, and **404** when it was not — which
means the second identical DELETE is a 404.

There is a real argument for making DELETE fully idempotent by returning 204
every time: the end state the client asked for is true either way. This API takes
the other position, because "there is nothing at this URL" is information the
client can use, and a 404 on the *first* attempt would otherwise be silently
indistinguishable from success. Both are defensible; what matters is that you can
say which one you chose and why.

```
uv run dojo test dotnet 07_rest_crud ex4
```

## Challenge — a collection endpoint a client can live with

Honest difficulty note: no new concepts, quite a lot of small decisions. This is
the exercise that most resembles a real ticket.

Edit `src/Api/L07_RestCrud/Challenge.cs`. `GET /l07/widgets/search` answers
**200** with one page of `WidgetDto` and an **`X-Total-Count`** response header
holding the number of matching rows.

- `sort` is `name` (default) or `price`
- `page` is 1-based, default 1
- `size` defaults to 3 and may not exceed 50

Anything outside those rules is a **400 validation problem**, keyed by the
offending parameter name — `sort`, `page` or `size`.

Note the `HttpResponse response` parameter in the signature: that is how a
minimal API handler sets a header while still returning a result object.

```
uv run dojo test dotnet 07_rest_crud challenge
```

## The gate

This is the entire gate class, `tests/Gates/L07_RestCrudTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DotnetDojo.Api.L07_RestCrud;
using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Gates;

public class L07_RestCrudTests
{
    [Fact]
    public async Task Ex1_ReadingAWidgetNeverLeaksTheEntity()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var list = await client.GetAsync("/l07/widgets");
        await Teach.Status(HttpStatusCode.OK, list,
            "GET /l07/widgets must answer 200 - reread README ex1.");
        Teach.Equal("1,3,2,4,5", await Ids(list),
            "Every widget, name ascending: Anvil, Bolt, Cog, Dynamo, Escapement.");

        string listBody = await client.GetStringAsync("/l07/widgets");
        Teach.True(!listBody.Contains("internalNotes", StringComparison.OrdinalIgnoreCase)
                   && !listBody.Contains("revision", StringComparison.OrdinalIgnoreCase),
            "The response is carrying the entity's private fields. InternalNotes and Revision "
                + "exist for the database and for you, not for a client - project into "
                + "WidgetDto instead of returning Widget.\n  body: " + listBody);

        var one = await client.GetAsync("/l07/widgets/4");
        await Teach.Status(HttpStatusCode.OK, one, "Widget 4 exists, so this is a 200.");
        var dto = await one.Content.ReadFromJsonAsync<WidgetJson>();
        Teach.Equal("Dynamo", dto?.Name, "Widget 4 is the Dynamo.");
        Teach.Equal("W-400", dto?.Sku, "…with sku W-400.");

        string oneBody = await client.GetStringAsync("/l07/widgets/4");
        Teach.True(!oneBody.Contains("internalNotes", StringComparison.OrdinalIgnoreCase),
            "The single-widget endpoint leaks InternalNotes too. Both read paths use the "
                + "same DTO.\n  body: " + oneBody);

        var missing = await client.GetAsync("/l07/widgets/99");
        await Teach.Status(HttpStatusCode.NotFound, missing, "There is no widget 99: 404.");
    }

    [Fact]
    public async Task Ex2_CreatingValidatesAndRefusesDuplicates()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var created = await client.PostAsJsonAsync("/l07/widgets",
            new { name = "Flywheel", sku = "W-600", priceCents = 7700 });
        await Teach.Status(HttpStatusCode.Created, created,
            "A successful POST is 201 Created - reread README ex2.");
        Teach.Equal("/l07/widgets/6", created.Headers.Location?.ToString(),
            "The Location header names the new resource.");

        var body = await created.Content.ReadFromJsonAsync<WidgetJson>();
        Teach.Equal("Flywheel", body?.Name, "The body is the created widget, as a DTO.");
        Teach.Equal(6, body?.Id, "…with the id the database generated.");

        var bad = await client.PostAsJsonAsync("/l07/widgets",
            new { name = "  ", sku = "", priceCents = 0 });
        await Teach.Status(HttpStatusCode.BadRequest, bad,
            "Three broken fields at once is still one 400.");
        Teach.True(ContentType(bad).Contains("application/problem+json"),
            "A validation failure should be a ProblemDetails document, so the content type "
                + $"is application/problem+json. Got: {ContentType(bad)}");

        var errors = await ErrorKeys(bad);
        Teach.Equal("name,priceCents,sku", errors,
            "Report every problem at once, keyed by field: \"name\", \"sku\" and "
                + "\"priceCents\". A 400 that names only the first thing you checked makes "
                + "the client fix its request one round trip at a time.");

        Teach.Equal(6, host.Query(db => db.Widgets.Count()),
            "A rejected create must not have written anything.");

        var duplicate = await client.PostAsJsonAsync("/l07/widgets",
            new { name = "Impostor", sku = "W-200", priceCents = 500 });
        await Teach.Status(HttpStatusCode.Conflict, duplicate,
            "Sku W-200 already belongs to widget 2. The request is well formed and the rule "
                + "it breaks is about the current state of the collection, so that is 409 - "
                + "not 400.");
    }

    [Fact]
    public async Task Ex3_PutReplacesAndIsIdempotent()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var replaced = await client.PutAsJsonAsync("/l07/widgets/2",
            new { name = "Cogwheel", sku = "W-200", priceCents = 1500 });
        await Teach.Status(HttpStatusCode.NoContent, replaced,
            "A successful PUT has nothing to return: 204 - reread README ex3.");

        var after = await client.GetFromJsonAsync<WidgetJson>("/l07/widgets/2");
        Teach.Equal("Cogwheel", after?.Name, "The name really changed.");
        Teach.Equal(1500, after?.PriceCents, "…and so did the price.");

        Teach.Equal("discontinue next year", host.Query(db => db.Widgets.Single(w => w.Id == 2).InternalNotes),
            "The client's payload has no InternalNotes field, and the row's notes must "
                + "survive a replace untouched. Copy the fields you accept onto the entity; "
                + "never map a request body over a whole entity.");

        var again = await client.PutAsJsonAsync("/l07/widgets/2",
            new { name = "Cogwheel", sku = "W-200", priceCents = 1500 });
        await Teach.Status(HttpStatusCode.NoContent, again,
            "PUT is idempotent: sending exactly the same request again is still a 204, not a "
                + "409 and not a second widget.");
        Teach.Equal(5, host.Query(db => db.Widgets.Count()),
            "…and the collection is still five widgets.");

        var invalid = await client.PutAsJsonAsync("/l07/widgets/2",
            new { name = "", sku = "W-200", priceCents = 1500 });
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "The same validation rules apply on replace as on create.");
        Teach.Equal("name", await ErrorKeys(invalid),
            "Only the name was wrong, so only \"name\" is in errors.");

        var missing = await client.PutAsJsonAsync("/l07/widgets/99",
            new { name = "Ghost", sku = "W-900", priceCents = 100 });
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "PUT to an id that does not exist is a 404 here. (Some APIs make PUT create it - "
                + "that is a design decision, and this one says no.)");
    }

    [Fact]
    public async Task Ex4_DeleteRemovesItOnceAndThenSaysSo()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var deleted = await client.DeleteAsync("/l07/widgets/3");
        await Teach.Status(HttpStatusCode.NoContent, deleted,
            "A successful DELETE is 204 - reread README ex4.");
        Teach.Equal("", await deleted.Content.ReadAsStringAsync(),
            "204 means there is no body at all.");
        Teach.Equal(4, host.Query(db => db.Widgets.Count()),
            "The row has to be gone from the table.");

        var gone = await client.GetAsync("/l07/widgets/3");
        await Teach.Status(HttpStatusCode.NotFound, gone,
            "…so reading it is now a 404.");

        var again = await client.DeleteAsync("/l07/widgets/3");
        await Teach.Status(HttpStatusCode.NotFound, again,
            "The second DELETE is a 404: there is nothing at that URL to delete.");

        var never = await client.DeleteAsync("/l07/widgets/99");
        await Teach.Status(HttpStatusCode.NotFound, never,
            "…and so is deleting something that never existed.");
    }

    [Fact]
    public async Task Challenge_TheCollectionEndpointSortsPagesAndCounts()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var byPrice = await client.GetAsync("/l07/widgets/search?sort=price&page=1&size=2");
        await Teach.Status(HttpStatusCode.OK, byPrice,
            "GET /l07/widgets/search?sort=price&page=1&size=2 must answer 200 - reread "
                + "README challenge.");
        Teach.Equal("3,2", await Ids(byPrice),
            "By price ascending: Bolt 300, Cog 1200, Anvil 4500, Dynamo 9900, Escapement "
                + "15000. Page 1 of size 2 is the first two.");
        Teach.Equal("5", Header(byPrice, "X-Total-Count"),
            "X-Total-Count is how many rows matched, not how many you returned - a client "
                + "needs it to know there is a page 2.");

        var lastPage = await client.GetAsync("/l07/widgets/search?sort=name&page=3&size=2");
        Teach.Equal("5", await Ids(lastPage),
            "By name the fifth widget is Escapement, and page 3 of size 2 holds only it.");

        var defaults = await client.GetAsync("/l07/widgets/search");
        Teach.Equal("1,3,2", await Ids(defaults),
            "With no query string, sort defaults to name, page to 1 and size to 3.");

        var badSort = await client.GetAsync("/l07/widgets/search?sort=sideways");
        await Teach.Status(HttpStatusCode.BadRequest, badSort,
            "\"sideways\" is not a sort this endpoint supports.");
        Teach.True(ContentType(badSort).Contains("application/problem+json"),
            $"Rejections are ProblemDetails here too. Got: {ContentType(badSort)}");
        Teach.Equal("sort", await ErrorKeys(badSort),
            "Key the error by the parameter that was wrong, so a client knows what to fix.");

        var badSize = await client.GetAsync("/l07/widgets/search?size=51");
        await Teach.Status(HttpStatusCode.BadRequest, badSize,
            "The page size is capped at 50; 51 is a 400, not a silent clamp.");
        Teach.Equal("size", await ErrorKeys(badSize), "…keyed \"size\".");

        var badPage = await client.GetAsync("/l07/widgets/search?page=0");
        await Teach.Status(HttpStatusCode.BadRequest, badPage, "Pages are 1-based.");
    }

    private static SqliteHost<WidgetDb> NewHost() =>
        new SqliteHost<WidgetDb>().Seed(db => db.Widgets.AddRange(
            new Widget { Id = 1, Name = "Anvil", Sku = "W-100", PriceCents = 4500, InternalNotes = "supplier: acme" },
            new Widget { Id = 2, Name = "Cog", Sku = "W-200", PriceCents = 1200, InternalNotes = "discontinue next year" },
            new Widget { Id = 3, Name = "Bolt", Sku = "W-300", PriceCents = 300, InternalNotes = "bulk only" },
            new Widget { Id = 4, Name = "Dynamo", Sku = "W-400", PriceCents = 9900, InternalNotes = "fragile" },
            new Widget { Id = 5, Name = "Escapement", Sku = "W-500", PriceCents = 15000, InternalNotes = "hand made" }));

    private static async Task<string> Ids(HttpResponseMessage response)
    {
        var items = await response.Content.ReadFromJsonAsync<List<WidgetJson>>();
        return string.Join(",", (items ?? []).Select(w => w.Id));
    }

    /// <summary>The keys of a ProblemDetails "errors" object, sorted - or "" if there are none.</summary>
    private static async Task<string> ErrorKeys(HttpResponseMessage response)
    {
        string body = await response.Content.ReadAsStringAsync();
        try
        {
            using var document = JsonDocument.Parse(body);
            if (!document.RootElement.TryGetProperty("errors", out var errors))
            {
                return $"(no \"errors\" property; body was {body})";
            }

            return string.Join(",", errors.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        }
        catch (JsonException)
        {
            return $"(not JSON: {body})";
        }
    }

    private static string ContentType(HttpResponseMessage response) =>
        response.Content.Headers.ContentType?.ToString() ?? "";

    private static string Header(HttpResponseMessage response, string name) =>
        response.Headers.TryGetValues(name, out var values) ? string.Join(",", values) : "";

    private sealed record WidgetJson(int Id, string? Name, string? Sku, int PriceCents);
}
```

In plain English: several of these assertions look at the *raw text* of the
response rather than a parsed object, because "does this string appear anywhere
in the body" is the only honest way to test that nothing leaked. Others use
`host.Query(...)` to read the database directly — a PUT that answers 204 and
quietly wiped `InternalNotes` would pass every HTTP check and fails here.

## The teaching point

The habit to build is to design the *contract* before the implementation. Write
down the URLs, the request shapes, the response shapes and every status code
each endpoint can produce — and only then start typing. It takes ten minutes and
it is the difference between an API whose behaviour you can state in a sentence
and one whose behaviour is whatever the code happens to do.

The security habit inside it is worth stating on its own: **enumerate the fields
you accept.** Not "bind the body and save it, minus the ones I remembered to
exclude" — enumerate. Every mass-assignment vulnerability in every framework
comes from a developer who wrote the exclusion list and then someone added a
column.

Next: **08_errors_logging**, where the failure paths get the same care the happy
path just got — one exception-handling middleware, ProblemDetails everywhere, and
logs that a stranger at 3am can actually use.
