# d03 — Results and status code drills

Eight problems on picking the right status code and the right `TypedResults`
helper: 200 versus 404 for an empty collection, 201 and its `Location`, 204,
409, 400 versus 422, content types, the union return type, and `CreatedAtRoute`.
They drill lesson **01_routing_endpoints** — go back to it if the choice between
these codes still feels like taste rather than a rule.

Everything is under `/d03/…` against `src/Api/D03_ResultsStatuscodes/Desk.cs`:
three bookings, three rooms, and a store that really mutates. Each gate gets its
own application, so an exercise that deletes something cannot affect the others.

## Exercise 1 — empty is not missing

Edit `src/Api/D03_ResultsStatuscodes/Ex1.cs`.

- `GET /d03/bookings` — **200** with the bookings, id ascending. An optional
  `state` filters them, and a filter that matches nothing is **still a 200**.
- `GET /d03/bookings/{id:int}` — **200**, or **404** when there is none.

```
uv run dojo test dotnet d03_results_statuscodes ex1
```

## Exercise 2 — 201, and the header that makes it useful

Edit `src/Api/D03_ResultsStatuscodes/Ex2.cs`. `POST /d03/bookings` with
`{"room": …, "guest": …}`:

- **201** with `Location: /d03/bookings/{id}` and the created booking as the body
- a blank room or a blank guest is a **400**, and nothing is written

```
uv run dojo test dotnet d03_results_statuscodes ex2
```

## Exercise 3 — 204 has nothing to say

Edit `src/Api/D03_ResultsStatuscodes/Ex3.cs`. `DELETE /d03/bookings/{id:int}` is
**204 with an empty body** when the booking was there and **404** when it was
not — including the second time you delete the same one.

```
uv run dojo test dotnet d03_results_statuscodes ex3
```

## Exercise 4 — four outcomes, one endpoint

Edit `src/Api/D03_ResultsStatuscodes/Ex4.cs`.
`PUT /d03/bookings/{id:int}/state` with `{"state": …}`:

- **400** when the state is not one of `Desk.States` — *even if the id is also
  wrong*
- **404** when there is no such booking
- **409** when the booking is already `cancelled`
- **204** otherwise, and the change sticks

The order those checks go in is the exercise.

```
uv run dojo test dotnet d03_results_statuscodes ex4
```

## Exercise 5 — 400 for malformed, 422 for impossible

Edit `src/Api/D03_ResultsStatuscodes/Ex5.cs`. `POST /d03/bookings/quote` with
`{"room": …, "nights": …}`:

- a blank room or `nights` below 1 → **400 validation problem**
  (`application/problem+json`) keyed `room` / `nights`
- a well-formed request naming a room the desk does not have → **422**
- otherwise **200** with `{"room": …, "nights": …, "totalCents": …}`, where the
  total is `capacity * Desk.NightlyRatePerHead * nights`

```
uv run dojo test dotnet d03_results_statuscodes ex5
```

## Exercise 6 — the same data, two content types

Edit `src/Api/D03_ResultsStatuscodes/Ex6.cs`.
`GET /d03/bookings/{id:int}/receipt?format=…`:

- `json` (the default) → **200 `application/json`** with
  `{"bookingId": …, "guest": …, "room": …}`
- `text` → **200 `text/plain`** with exactly `Booking 1: Ada in Sakura`
- anything else → **400**
- a booking that does not exist → **404**, whichever format was asked for

```
uv run dojo test dotnet d03_results_statuscodes ex6
```

## Exercise 7 — the return type lists every outcome

Edit `src/Api/D03_ResultsStatuscodes/Ex7.cs`. Keep the signature's union return
type — `Results<Ok<DeskRoom>, NotFound, BadRequest<string>>` — and fill in
`GET /d03/rooms/{id:int}`:

- an id above **100** → **400** whose body names the id
- an id the desk has no room for → **404**
- otherwise → **200** with the room

```
uv run dojo test dotnet d03_results_statuscodes ex7
```

## Exercise 8 — CreatedAtRoute, and a conflict that explains itself

Edit `src/Api/D03_ResultsStatuscodes/Ex8.cs`. Give
`GET /d03/desk/rooms/{id:int}` the name `Ex8.RoomRouteName` (**200** with the
room, **404** otherwise), then `POST /d03/desk/rooms` with
`{"name": …, "capacity": …}`:

- **201** whose `Location` is generated **from that route name**, body = the room
- a blank name or a capacity below 1 → **400**
- a name the desk already has → **409 ProblemDetails** whose `detail` names it

```
uv run dojo test dotnet d03_results_statuscodes ex8
```

## The gate

This is the entire gate class, `tests/Gates/D03_ResultsStatuscodesTests.cs`:

```csharp
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
}
```

…where the helpers are `ContentType`, `Ids` and `ErrorKeys` (small readers over
the response) plus five `private sealed record` DTOs.
