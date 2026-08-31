using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class D03_ResultsStatuscodesTests
{
    [Fact]
    public async Task Ex1_AnEmptyListIsStillAnAnswer()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var all = await client.GetAsync("/d03/bookings");
        await Teach.Status(HttpStatusCode.OK, all,
            "GET /d03/bookings must answer 200 - reread README ex1.");
        Teach.Equal("1,2,3", await Ids(all), "Three bookings, id ascending.");

        var confirmed = await client.GetAsync("/d03/bookings?state=confirmed");
        Teach.Equal("1,2", await Ids(confirmed), "Two of them are confirmed.");

        var pending = await client.GetAsync("/d03/bookings?state=pending");
        await Teach.Status(HttpStatusCode.OK, pending,
            "Nothing is pending, and that is a 200 with an empty array. A 404 would say the "
                + "collection does not exist, which is a different claim - and a client that "
                + "renders a list has to handle it differently.");
        Teach.Equal("", await Ids(pending), "…with nothing in it.");

        var one = await client.GetAsync("/d03/bookings/2");
        await Teach.Status(HttpStatusCode.OK, one, "Booking 2 exists.");
        var booking = await one.Content.ReadFromJsonAsync<BookingDto>();
        Teach.Equal("Grace", booking?.Guest, "…and it is Grace's.");

        var missing = await client.GetAsync("/d03/bookings/99");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "A single item that is not there IS a 404 - this is the case the empty list is "
                + "not.");
    }

    [Fact]
    public async Task Ex2_TheCreateAnswers201AndSaysWhereItPutIt()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var created = await client.PostAsJsonAsync("/d03/bookings",
            new { room = "Sakura", guest = "Zoe" });
        await Teach.Status(HttpStatusCode.Created, created,
            "A POST that made a new resource is 201, not 200 - reread README ex2.");
        Teach.Equal("/d03/bookings/4", created.Headers.Location?.ToString(),
            "201 without a Location is half an answer: the client has no idea where the thing "
                + "it just made now lives. Three bookings are seeded, so this one is 4.");

        var booking = await created.Content.ReadFromJsonAsync<BookingDto>();
        Teach.Equal(4, booking?.Id, "The body is the created booking…");
        Teach.Equal("pending", booking?.State,
            "…and a new booking starts as pending. The client does not get to choose.");

        var blankRoom = await client.PostAsJsonAsync("/d03/bookings",
            new { room = "  ", guest = "Zoe" });
        await Teach.Status(HttpStatusCode.BadRequest, blankRoom, "A blank room is a 400.");

        var blankGuest = await client.PostAsJsonAsync("/d03/bookings",
            new { room = "Sakura", guest = "" });
        await Teach.Status(HttpStatusCode.BadRequest, blankGuest,
            "…and so is a blank guest. Check both before you write anything.");

        var after = await client.GetAsync("/d03/bookings");
        Teach.Equal("1,2,3,4", await Ids(after),
            "Two rejected requests must not have created anything. Validate first, then add.");
    }

    [Fact]
    public async Task Ex3_A204HasNothingToSay()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var deleted = await client.DeleteAsync("/d03/bookings/2");
        await Teach.Status(HttpStatusCode.NoContent, deleted,
            "A successful DELETE is 204 - reread README ex3.");
        Teach.Equal("", await deleted.Content.ReadAsStringAsync(),
            "204 means NO content. Writing a body - even {\"ok\":true} - contradicts the "
                + "status line, and some clients will not read it.");

        var gone = await client.GetAsync("/d03/bookings/2");
        await Teach.Status(HttpStatusCode.NotFound, gone,
            "…and the booking really has to be gone, not just missing from the response.");

        var again = await client.DeleteAsync("/d03/bookings/2");
        await Teach.Status(HttpStatusCode.NotFound, again,
            "Deleting it a second time is a 404: there is nothing there to remove. (Some APIs "
                + "answer 204 again to make DELETE idempotent; this one is explicit, and the "
                + "gate is the contract.)");

        var never = await client.DeleteAsync("/d03/bookings/99");
        await Teach.Status(HttpStatusCode.NotFound, never, "Booking 99 never existed: 404.");
    }

    [Fact]
    public async Task Ex4_FourOutcomesAndTheOrderYouCheckThemIn()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var ok = await client.PutAsJsonAsync("/d03/bookings/2/state", new { state = "pending" });
        await Teach.Status(HttpStatusCode.NoContent, ok,
            "A successful state change has nothing to say: 204 - reread README ex4.");

        var after = await client.GetFromJsonAsync<BookingDto>("/d03/bookings/2");
        Teach.Equal("pending", after?.State, "…and the change really happened.");

        var missing = await client.PutAsJsonAsync("/d03/bookings/99/state",
            new { state = "confirmed" });
        await Teach.Status(HttpStatusCode.NotFound, missing, "There is no booking 99: 404.");

        var nonsense = await client.PutAsJsonAsync("/d03/bookings/1/state",
            new { state = "banana" });
        await Teach.Status(HttpStatusCode.BadRequest, nonsense,
            "\"banana\" is not a state this system has, and that is wrong about the REQUEST: "
                + "400.");

        var nonsenseOnMissing = await client.PutAsJsonAsync("/d03/bookings/99/state",
            new { state = "banana" });
        await Teach.Status(HttpStatusCode.BadRequest, nonsenseOnMissing,
            "A malformed body is a 400 even when the id is also wrong. Validate the request "
                + "before you go looking for the resource: a 404 here would tell the caller to "
                + "fix the id when the real problem is the body.");

        var cancelled = await client.PutAsJsonAsync("/d03/bookings/3/state",
            new { state = "confirmed" });
        await Teach.Status(HttpStatusCode.Conflict, cancelled,
            "Booking 3 is cancelled. The request is well formed and the booking exists, but "
                + "its state forbids the change - that is 409 Conflict, the code most APIs "
                + "forget and answer 400 for.");
    }

    [Fact]
    public async Task Ex5_MalformedIs400AndImpossibleIs422()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var quote = await client.PostAsJsonAsync("/d03/bookings/quote",
            new { room = "Kiri", nights = 3 });
        await Teach.Status(HttpStatusCode.OK, quote,
            "POST /d03/bookings/quote must answer 200 for a room the desk has - reread README "
                + "ex5.");
        var body = await quote.Content.ReadFromJsonAsync<QuoteDto>();
        Teach.Equal(24000, body?.TotalCents,
            "Kiri sleeps 8, the rate is 1000 per head per night, and the stay is 3 nights.");

        var blank = await client.PostAsJsonAsync("/d03/bookings/quote",
            new { room = "  ", nights = 3 });
        await Teach.Status(HttpStatusCode.BadRequest, blank, "A blank room is a 400.");
        Teach.True(ContentType(blank).Contains("application/problem+json"),
            "…and a validation failure is a ProblemDetails document, so the client can read "
                + "the errors rather than guess at a string. Got: " + ContentType(blank));
        Teach.Equal("room", await ErrorKeys(blank), "…keyed by the offending field.");

        var noNights = await client.PostAsJsonAsync("/d03/bookings/quote",
            new { room = "Kiri", nights = 0 });
        await Teach.Status(HttpStatusCode.BadRequest, noNights, "Zero nights is a 400…");
        Teach.Equal("nights", await ErrorKeys(noNights), "…keyed \"nights\".");

        var unknown = await client.PostAsJsonAsync("/d03/bookings/quote",
            new { room = "Hinoki", nights = 2 });
        await Teach.Status(HttpStatusCode.UnprocessableEntity, unknown,
            "This request is perfectly well formed - a non-blank room and a sensible number of "
                + "nights - and the server still cannot carry it out, because no such room "
                + "exists. That is 422 Unprocessable Content: the syntax was fine, the meaning "
                + "was not.");
    }

    [Fact]
    public async Task Ex6_TheSameDataInTwoContentTypes()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var json = await client.GetAsync("/d03/bookings/1/receipt");
        await Teach.Status(HttpStatusCode.OK, json,
            "GET /d03/bookings/1/receipt must answer 200 - reread README ex6.");
        Teach.True(ContentType(json).Contains("application/json"),
            "No format means JSON. Got: " + ContentType(json));
        var receipt = await json.Content.ReadFromJsonAsync<ReceiptDto>();
        Teach.Equal("Ada", receipt?.Guest, "Booking 1 is Ada's…");
        Teach.Equal("Sakura", receipt?.Room, "…in the Sakura room.");

        var text = await client.GetAsync("/d03/bookings/1/receipt?format=text");
        await Teach.Status(HttpStatusCode.OK, text, "format=text is the other supported shape.");
        Teach.True(ContentType(text).Contains("text/plain"),
            "…and it is text/plain, not JSON with quotes round it. Got: " + ContentType(text));
        Teach.Equal("Booking 1: Ada in Sakura", await text.Content.ReadAsStringAsync(),
            "…with exactly this line.");

        var bad = await client.GetAsync("/d03/bookings/1/receipt?format=xml");
        await Teach.Status(HttpStatusCode.BadRequest, bad,
            "\"xml\" is not a format this endpoint offers: 400 rather than a silent fallback "
                + "to JSON, because a client that asked for XML and got JSON has no way to "
                + "notice.");

        var missing = await client.GetAsync("/d03/bookings/99/receipt?format=text");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "There is no booking 99, whatever format was asked for.");
    }

    [Fact]
    public async Task Ex7_TheReturnTypeListsEveryOutcome()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var room = await client.GetAsync("/d03/rooms/2");
        await Teach.Status(HttpStatusCode.OK, room,
            "GET /d03/rooms/2 must answer 200 - reread README ex7.");
        var body = await room.Content.ReadFromJsonAsync<RoomDto>();
        Teach.Equal("Kiri", body?.Name, "Room 2 is Kiri…");
        Teach.Equal(8, body?.Capacity, "…and it sleeps 8.");

        var missing = await client.GetAsync("/d03/rooms/99");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "Room 99 is not there. NotFound is one of the three cases the signature promises.");

        var silly = await client.GetAsync("/d03/rooms/101");
        await Teach.Status(HttpStatusCode.BadRequest, silly,
            "An id above 100 is not a lookup that can succeed: 400. If this compiles but "
                + "returns something outside the union, the compiler would have told you - "
                + "which is the entire point of writing the outcomes into the return type.");
        Teach.True((await silly.Content.ReadAsStringAsync()).Contains("101"),
            "…and the 400 names the id it rejected.");
    }

    [Fact]
    public async Task Ex8_CreatedAtRouteAndAConflictThatExplainsItself()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var existing = await client.GetAsync("/d03/desk/rooms/2");
        await Teach.Status(HttpStatusCode.OK, existing,
            "GET /d03/desk/rooms/2 must answer 200 - reread README ex8.");

        var created = await client.PostAsJsonAsync("/d03/desk/rooms",
            new { name = "Hinoki", capacity = 6 });
        await Teach.Status(HttpStatusCode.Created, created,
            "A new room is a 201. A 500 here usually means CreatedAtRoute could not find the "
                + "name - WithName is what makes a route addressable.");
        Teach.Equal("/d03/desk/rooms/4", created.Headers.Location?.AbsolutePath,
            "Three rooms are seeded, so this is 4 - and the URL came from the route table "
                + "rather than from string concatenation. (CreatedAtRoute writes an ABSOLUTE "
                + "url, so the gate reads its path; ex2's hand-built Location was relative. "
                + "Both are legal.)");
        var room = await created.Content.ReadFromJsonAsync<RoomDto>();
        Teach.Equal("Hinoki", room?.Name, "…and the body is the room that was created.");

        var duplicate = await client.PostAsJsonAsync("/d03/desk/rooms",
            new { name = "Kiri", capacity = 2 });
        await Teach.Status(HttpStatusCode.Conflict, duplicate,
            "The desk already has a Kiri. The request is well formed and the state forbids "
                + "it: 409.");
        Teach.True(ContentType(duplicate).Contains("application/problem+json"),
            "…and a 409 a client has to act on deserves a ProblemDetails body. Got: "
                + ContentType(duplicate));
        Teach.True((await duplicate.Content.ReadAsStringAsync()).Contains("Kiri"),
            "…whose detail names the room, so the caller knows which one collided.");

        var blank = await client.PostAsJsonAsync("/d03/desk/rooms",
            new { name = "  ", capacity = 6 });
        await Teach.Status(HttpStatusCode.BadRequest, blank, "A blank name is a 400.");

        var empty = await client.PostAsJsonAsync("/d03/desk/rooms",
            new { name = "Nara", capacity = 0 });
        await Teach.Status(HttpStatusCode.BadRequest, empty, "…and so is a capacity of 0.");
    }

    // … private helpers and DTO records, listed below …

    private static string ContentType(HttpResponseMessage response) =>
        response.Content.Headers.ContentType?.ToString() ?? "";

    private static async Task<string> Ids(HttpResponseMessage response)
    {
        var bookings = await response.Content.ReadFromJsonAsync<List<BookingDto>>();

        return string.Join(",", (bookings ?? []).Select(b => b.Id));
    }

    private static async Task<string> ErrorKeys(HttpResponseMessage response)
    {
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>();

        return string.Join(",", (problem?.Errors ?? []).Keys.OrderBy(k => k, StringComparer.Ordinal));
    }

    private sealed record BookingDto(int Id, string? Room, string? Guest, string? State);

    private sealed record QuoteDto(string? Room, int Nights, int TotalCents);

    private sealed record ReceiptDto(int BookingId, string? Guest, string? Room);

    private sealed record RoomDto(int Id, string? Name, int Capacity);

    private sealed record ProblemDto(Dictionary<string, string[]>? Errors);
}
