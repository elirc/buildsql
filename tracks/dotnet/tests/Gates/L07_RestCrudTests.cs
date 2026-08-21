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
