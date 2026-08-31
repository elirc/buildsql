# d24 - the mixed gauntlet

This set is cumulative: nothing here is a new topic, and every exercise fuses
two or three things the track already taught - routing and results (**d01**,
**d03**), DI lifetimes (**d04**), configuration and options (**d08**, **d09**),
EF Core queries and projections (**d11**, **d14**), REST reads and writes
(**d15**, **d16**), validation and problem details (**d17**, **d18**), logging
(**d19**) and JWT authorization (**d20**, **d21**). If a problem here feels
like guessing, the lesson it draws on is named in its subsection - go back to
that one first.

The domain is a museum (`src/Api/D24_MixedGauntlet/Model.cs`): three exhibits
with a fixed `Capacity`, and tickets held against them by `ada`, `bo` and `cy`.
One rule runs through every capacity question in the set:

```
seats left = Capacity - (tickets on that exhibit where Cancelled is false)
```

A cancelled ticket is still a row and no longer holds a seat. The gates seed
Bronze Age (north, capacity 3), Cartography (north, capacity 0) and Deep Time
(south, capacity 5), with four tickets - so exhibit 1 has one seat left,
exhibit 2 has none, and exhibit 3 has four. Everything is under `/d24/...`,
authentication is the named scheme `d24-bearer`, and the two policies are
`D24Policies.Visitor` and `D24Policies.Curator`.

## Exercise 1 - routing plus results

Routing (**d01**) fused with results (**d03**). Edit
`src/Api/D24_MixedGauntlet/Ex1.cs`. One catch-all route is doing two jobs and
parsing its way through them. Split it:

- `GET /d24/exhibits/open` - 200 with the `ExhibitDto`s whose `Capacity` is
  above zero, **Name A-Z**
- `GET /d24/exhibits/{id:int}` - 200 with that `ExhibitDto`, 404 when there is
  no such exhibit
- `GET /d24/exhibits/abc` - **404 from routing**, before any handler of yours
  runs

```
uv run dojo test dotnet d24_mixed_gauntlet ex1
```

## Exercise 2 - DI lifetimes through one endpoint

Lifetimes (**d04**) fused with a single request. Edit
`src/Api/D24_MixedGauntlet/Ex2.cs`, `Ex2Services` only - the handler is given.
`GET /d24/visits` asks the container for `ID24Visit` twice in one request and
reports the turnstile's next number:

- `perRequest` is the **same** id for both injections in one request, and a
  **different** id on the next request
- `total` counts every request the process has ever seen: 1, then 2

```
uv run dojo test dotnet d24_mixed_gauntlet ex2
```

## Exercise 3 - options plus validation

Options (**d09**) fused with validation (**d17**). Edit
`src/Api/D24_MixedGauntlet/Ex3.cs`. `POST /d24/reservations` takes a
`NewReservation`:

- blank `holder` and a `count` outside 1..max - **400** validation problem
  carrying **both** keys, `type` `D24Problems.Base + "invalid-request"`
- the maximum comes from `IOptions<D24Options>.Value.MaxTicketsPerVisitor`, not
  from a constant - nothing configures it here, so the class default of 4
  holds, and the gate boots a second host that sets
  `Dojo:D24:MaxTicketsPerVisitor` to 2
- unknown exhibit - 404
- otherwise 200 with `HeldDto`

```
uv run dojo test dotnet d24_mixed_gauntlet ex3
```

## Exercise 4 - projection plus a query budget

EF Core grouping (**d11**) fused with projection (**d14**). Edit
`src/Api/D24_MixedGauntlet/Ex4.cs`. `GET /d24/galleries` returns one
`GalleryRow` per gallery, **gallery name A-Z**, where `sold` counts the
**non-cancelled** tickets on that gallery's exhibits - and it must cost **at
most two** database round trips. The gate counts them.

```
uv run dojo test dotnet d24_mixed_gauntlet ex4
```

## Exercise 5 - a REST write that refuses in problem details

REST writes (**d16**) fused with problem details (**d18**). Edit
`src/Api/D24_MixedGauntlet/Ex5.cs`. `POST /d24/exhibits/{id:int}/tickets` takes
a `NewTicket`:

- unknown exhibit - **404** as problem details, `type`
  `D24Problems.Base + "exhibit-not-found"`, a `detail` naming the id, and
  `instance`
- no seats left - **409** as problem details, `type`
  `D24Problems.Base + "sold-out"`, with the extension member **`seatsLeft`**
- otherwise **201**, `Location: /d24/tickets/{newId}`, and the `TicketDto` that
  was really saved

```
uv run dojo test dotnet d24_mixed_gauntlet ex5
```

## Exercise 6 - authorization plus structured logging

Authorization (**d20**) fused with logging (**d19**). Edit
`src/Api/D24_MixedGauntlet/Ex6.cs`. `GET /d24/tickets` is behind
`D24Policies.Visitor`:

- 200 with the caller's **own** tickets as `TicketDto`s, id ascending - or
  **every** ticket when the caller is in the `curator` role
- exactly **one** `Information` entry per request, written with a message
  template so it carries `Holder` and `Count` as **named properties**

```
uv run dojo test dotnet d24_mixed_gauntlet ex6
```

## Exercise 7 - authorization, EF Core, problem details, logging

Four at once: ownership (**d20**), EF Core writes (**d10**), problem details
(**d18**) and log levels (**d19**). Edit `src/Api/D24_MixedGauntlet/Ex7.cs`.
`POST /d24/tickets/{id:int}/cancel` is behind `D24Policies.Visitor`:

1. no such ticket, **or** somebody else's and the caller is not a curator -
   **404**, and the two must be indistinguishable
2. already cancelled - **409** problem details, `type`
   `D24Problems.Base + "already-cancelled"`
3. otherwise **204**, with `Cancelled` actually written

Exactly one log entry per request: `Information` for the 404 and for the
success, **`Warning`** for the 409, and nothing at `Error`.

```
uv run dojo test dotnet d24_mixed_gauntlet ex7
```

## Exercise 8 - everything this track teaches, on one write

Policy authorization (**d21**), options (**d09**), collected validation
(**d17**), EF Core (**d10**), problem details (**d18**) and logging (**d19**),
in one handler. Edit `src/Api/D24_MixedGauntlet/Ex8.cs`.
`POST /d24/bookings` is behind `D24Policies.Curator`, so 401 without a token
and 403 without the role. Then, in this order:

1. **400** collecting `exhibitId`, `holder` and `count` **together**, `type`
   `D24Problems.Base + "invalid-request"` - the count limit is the one from
   `IOptions<D24Options>`
2. unknown exhibit - **404**
3. fewer seats left than asked for - **409** problem details with `seatsLeft`,
   and nothing written
4. otherwise **201**, `Location: /d24/bookings/{firstTicketId}`, a
   `BookingDto` listing the new ticket ids ascending, the holder trimmed, day
   1, and all of it in **one** `SaveChangesAsync`

Exactly one log entry per request, carrying `TraceId` and `Count`.

```
uv run dojo test dotnet d24_mixed_gauntlet ex8
```

## The gate

This is the entire gate class, `tests/Gates/D24_MixedGauntletTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using DotnetDojo.Api.D24_MixedGauntlet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Gates;

public class D24_MixedGauntletTests
{
    [Fact]
    public async Task Ex1_RoutingDecidesBeforeAnyHandlerRuns()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var open = await client.GetAsync("/d24/exhibits/open");
        await Teach.Status(HttpStatusCode.OK, open,
            "This exercise fuses ROUTING with RESULTS. GET /d24/exhibits/open must answer 200 "
                + "with the exhibits that have room. A 400 here means \"open\" was fed to a "
                + "handler that tried to parse it as an id: one catch-all route is still doing "
                + "two jobs - reread README ex1.");
        var openRows = await open.Content.ReadFromJsonAsync<List<ExhibitReadDto>>() ?? [];
        Teach.Equal("1,3", string.Join(",", openRows.Select(e => e.Id)),
            "Bronze Age (capacity 3) and Deep Time (capacity 5) have capacity above zero; "
                + "Cartography has capacity 0 and is not open. Name A-Z puts Bronze Age first.");
        Teach.Equal("Bronze Age", openRows.Count > 0 ? openRows[0].Name : null,
            "...ordered by Name, not by the order the rows were seeded in.");

        var one = await client.GetAsync("/d24/exhibits/2");
        await Teach.Status(HttpStatusCode.OK, one,
            "A numeric segment still has to reach the by-id handler. Adding a literal route "
                + "must not take the parameter route away.");
        var exhibit = await one.Content.ReadFromJsonAsync<ExhibitReadDto>();
        Teach.Equal("Cartography", exhibit?.Name, "Exhibit 2 is Cartography...");
        Teach.Equal("north", exhibit?.Gallery, "...in the north gallery...");
        Teach.Equal(0, exhibit?.Capacity, "...with a capacity of zero, which is a number and not a gap.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d24/exhibits/99"),
            "There is no exhibit 99, and that is a decision the handler makes: FirstOrDefault "
                + "returns null, First would have thrown and become a 500.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d24/exhibits/abc"),
            "\"abc\" is not an id at all, so ROUTING should answer this one - the :int "
                + "constraint means no route matches and the framework returns 404 before any "
                + "code of yours runs. A 400 means a handler parsed the segment by hand, which "
                + "is validation doing routing's job.");
    }

    [Fact]
    public async Task Ex2_OneVisitPerRequestAndOneTurnstileForever()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d24/visits");
        await Teach.Status(HttpStatusCode.OK, first,
            "This exercise fuses DI LIFETIMES with a single endpoint. GET /d24/visits must "
                + "answer 200 - reread README ex2.");
        var one = await first.Content.ReadFromJsonAsync<VisitReadDto>();

        Teach.True(one?.PerRequest != "different-instances-in-one-request",
            "The handler asked the container for ID24Visit twice in ONE request and got two "
                + "different objects. Transient means a new instance per injection point, so "
                + "nothing that has to be the same everywhere inside a request can be "
                + "transient - scoped is the lifetime whose boundary IS the request.");
        Teach.True(!string.IsNullOrWhiteSpace(one?.PerRequest),
            "...and the shared instance reports its id.");
        Teach.Equal(1, one?.Total, "The first caller through the turnstile is number 1.");

        var second = await client.GetAsync("/d24/visits");
        var two = await second.Content.ReadFromJsonAsync<VisitReadDto>();

        Teach.True(one?.PerRequest != two?.PerRequest,
            "A second request must get a NEW visit id. A singleton would have carried the "
                + "first request's identity into the second one, which is how one user starts "
                + "seeing another user's request state.");
        Teach.Equal(2, two?.Total,
            "...and the turnstile must still be counting: 2. A 1 means a fresh counter was "
                + "built for this request, so the count cannot outlive it. Only a singleton "
                + "holds state for the life of the process.");
    }

    [Fact]
    public async Task Ex3_TheLimitIsASettingAndEveryFailureIsReported()
    {
        using var host = new SqliteHost<D24Db>();
        using var tight = Limited(host, 2);
        Seed(host);
        using var client = host.CreateClient();
        using var tightClient = tight.CreateClient();

        var bad = await client.PostAsJsonAsync("/d24/reservations",
            new { exhibitId = 1, holder = "   ", count = 9 });
        await Teach.Status(HttpStatusCode.BadRequest, bad,
            "This exercise fuses OPTIONS with VALIDATION. A blank holder and a count of 9 are "
                + "both wrong, so this is a 400 - reread README ex3.");
        var errors = await bad.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(errors?.Errors?.ContainsKey("holder") == true, "...keyed \"holder\"...");
        Teach.True(errors?.Errors?.ContainsKey("count") == true,
            "...AND keyed \"count\". Returning on the first failure tells the caller about one "
                + "problem, they fix it, resend, and discover the next - collect every failure "
                + "into one dictionary and report them together.");
        Teach.Equal(D24Problems.Base + "invalid-request", errors?.Type,
            "...under this set's own problem type, which is the field a client branches on.");

        var three = await client.PostAsJsonAsync("/d24/reservations",
            new { exhibitId = 1, holder = "ada", count = 3 });
        await Teach.Status(HttpStatusCode.OK, three,
            "Nothing configures Dojo:D24 in this host, so D24Options keeps its class default "
                + "of 4 and three tickets are fine.");
        Teach.Equal(3, (await three.Content.ReadFromJsonAsync<HeldReadDto>())?.Held,
            "...and the answer says how many are held.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PostAsJsonAsync("/d24/reservations",
                new { exhibitId = 99, holder = "ada", count = 1 }),
            "The payload is well formed and exhibit 99 does not exist, so this is about the "
                + "world and not the request: 404, not another 400.");

        var overLimit = await tightClient.PostAsJsonAsync("/d24/reservations",
            new { exhibitId = 1, holder = "ada", count = 3 });
        await Teach.Status(HttpStatusCode.BadRequest, overLimit,
            "This second host sets Dojo:D24:MaxTicketsPerVisitor to 2, and the SAME request "
                + "that was fine a moment ago must now be refused. A 200 means the limit is "
                + "still a constant in the handler - a setting nobody can change without a "
                + "deploy. Read it from IOptions<D24Options>.Value.");
        var refused = await overLimit.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.True(refused?.Errors?.ContainsKey("count") == true, "...keyed \"count\"...");
        Teach.True(string.Join(" ", refused?.Errors?["count"] ?? []).Contains("2"),
            "...and the message names the limit that is actually in force, so it moves with "
                + "the configuration instead of hard-coding a number the operator changed.");

        await Teach.Status(HttpStatusCode.OK,
            await tightClient.PostAsJsonAsync("/d24/reservations",
                new { exhibitId = 1, holder = "ada", count = 2 }),
            "Two is exactly the configured maximum, and the boundary is inclusive.");
    }

    [Fact]
    public async Task Ex4_TwoQueriesAndACancelledTicketIsNotSold()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d24/galleries");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "This exercise fuses EF CORE PROJECTION with a query budget. GET /d24/galleries "
                + "must answer 200 - reread README ex4.");

        var rows = await response.Content.ReadFromJsonAsync<List<GalleryReadDto>>() ?? [];
        Teach.Equal("north,south", string.Join(",", rows.Select(r => r.Gallery)),
            "One row per gallery, gallery name A-Z - two galleries, not three exhibits.");
        Teach.Equal("2,1", string.Join(",", rows.Select(r => r.Exhibits)),
            "Bronze Age and Cartography are north; Deep Time is south.");
        Teach.Equal("2,1", string.Join(",", rows.Select(r => r.Sold)),
            "North has sold 2 (ada and bo on Bronze Age). South has sold 1, NOT 2: ticket 3 on "
                + "Deep Time is cancelled, and a cancelled ticket holds no seat. The filter "
                + "belongs in the query, where the rows never travel.");

        Teach.True(commands <= 2,
            "The answer is right and it cost " + commands + " round trips to the database. "
                + "That is an N+1 loop: one query for the exhibits and then one more for each "
                + "of them, a cost that grows with the data and is invisible in the response "
                + "body. Two grouped queries, aggregated by the database, is the budget.");
    }

    [Fact]
    public async Task Ex5_ACreateThatRefusesInProblemDetails()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var missing = await client.PostAsJsonAsync("/d24/exhibits/99/tickets",
            new { holder = "dee", day = 2 });
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "This exercise fuses REST WRITES with PROBLEM DETAILS. There is no exhibit 99 - "
                + "reread README ex5.");
        Teach.Equal("application/problem+json", missing.Content.Headers.ContentType?.MediaType,
            "...and it says so in a body a client can parse, not as an empty 404.");
        var gone = await missing.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(D24Problems.Base + "exhibit-not-found", gone?.Type,
            "The type URI is the stable identity of this failure; titles get reworded and "
                + "details change with every occurrence.");
        Teach.True(gone?.Detail?.Contains("99") == true,
            "...and the detail is about THIS occurrence, so it names the id that was asked "
                + "for.\n  detail: " + (gone?.Detail ?? "(none)"));
        Teach.Equal("/d24/exhibits/99/tickets", gone?.Instance,
            "...and instance says which request it was.");

        var full = await client.PostAsJsonAsync("/d24/exhibits/2/tickets",
            new { holder = "dee", day = 2 });
        await Teach.Status(HttpStatusCode.Conflict, full,
            "Cartography has a capacity of 0, so there is nothing to give away. Nothing the "
                + "client sent is malformed, so this is 409 and not 400.");
        Teach.Equal(0, (await full.Content.ReadFromJsonAsync<ProblemDto>())?.SeatsLeft,
            "...and seatsLeft is 0: a number the client can act on, not an absent field it has "
                + "to ask a second request to discover.");

        var created = await client.PostAsJsonAsync("/d24/exhibits/1/tickets",
            new { holder = "dee", day = 3 });
        await Teach.Status(HttpStatusCode.Created, created,
            "Bronze Age has capacity 3 and two live tickets, so one seat is left: 201, because "
                + "a new thing now exists.");
        Teach.Equal("/d24/tickets/5", created.Headers.Location?.ToString(),
            "...and Location says WHERE it now lives, so the client does not have to guess the "
                + "id out of the body.");
        var ticket = await created.Content.ReadFromJsonAsync<TicketReadDto>();
        Teach.Equal(5, ticket?.Id, "Four tickets were seeded, so the new one is 5.");
        Teach.Equal(1, ticket?.ExhibitId, "...on exhibit 1...");
        Teach.Equal("dee", ticket?.Holder, "...for dee...");
        Teach.Equal(3, ticket?.Day, "...on day 3...");
        Teach.Equal(false, ticket?.Cancelled, "...and it starts live.");
        Teach.Equal("dee:1:3", host.Query(db => db.Tickets.Where(t => t.Id == 5)
            .Select(t => t.Holder + ":" + t.ExhibitId + ":" + t.Day).SingleOrDefault() ?? "(nothing was saved)"),
            "...and that is what was actually written. A correct-looking body with no row "
                + "behind it means SaveChangesAsync never ran.");

        var soldOut = await client.PostAsJsonAsync("/d24/exhibits/1/tickets",
            new { holder = "eve", day = 3 });
        await Teach.Status(HttpStatusCode.Conflict, soldOut,
            "That last seat is now taken, so the very next request is a 409.");
        var problem = await soldOut.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(D24Problems.Base + "sold-out", problem?.Type, "...under the sold-out type...");
        Teach.Equal(0, problem?.SeatsLeft, "...with zero seats left.");

        var southern = await client.PostAsJsonAsync("/d24/exhibits/3/tickets",
            new { holder = "eve", day = 6 });
        await Teach.Status(HttpStatusCode.Created, southern,
            "Deep Time has capacity 5, one live ticket and one CANCELLED one. Counting the "
                + "cancelled row as a seat would leave 3 instead of 4 - it still lets this "
                + "through, and it is wrong the moment the exhibit fills up.");
        Teach.Equal("/d24/tickets/6", southern.Headers.Location?.ToString(), "...and it is ticket 6.");
    }

    [Fact]
    public async Task Ex6_TheTokenNarrowsTheQueryAndTheLogCarriesFields()
    {
        using var host = new SqliteHost<D24Db>();
        var logs = new LogCapture();
        using var logged = Logged(host, logs);
        Seed(host);
        using var client = logged.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d24/tickets"),
            "This exercise fuses AUTHORIZATION with STRUCTURED LOGGING. No token at all is a "
                + "401 - reread README ex6.");

        logs.Clear();
        var mine = await client.SendAsync(Get("/d24/tickets", Token("ada")));
        await Teach.Status(HttpStatusCode.OK, mine, "A valid visitor token is a 200.");
        Teach.Equal("1,3", await TicketIds(mine),
            "Ada holds tickets 1 and 3 - and only those. The token said who is asking and the "
                + "query has to say so too: a filter applied after loading every row has "
                + "already shipped everybody's data across the wire, and is one refactor away "
                + "from being forgotten. Ticket 3 is cancelled and still hers.");

        var entry = Single(logs, "Exactly one Information entry per request.");
        Teach.Equal(LogLevel.Information, entry.Level, "A visitor reading their own tickets is ordinary news.");
        Teach.Equal("2", Prop(entry, "Count"),
            "There is no Count property on this entry. An interpolated string is rendered "
                + "before the logger ever sees it, so the numbers are baked into one opaque "
                + "sentence and the only query left is a substring search. Use a message "
                + "TEMPLATE with named placeholders.\n" + logs.Dump());
        Teach.Equal("ada", Prop(entry, "Holder"),
            "...and no Holder either. \"Show me every listing for ada\" has to be a field "
                + "match, or it stops working the day somebody rewords the sentence.");
        Teach.True(entry.Message.Contains("2") && entry.Message.Contains("ada"),
            "...while the rendered message still reads naturally. A template gives you BOTH "
                + "the sentence a human reads and the fields a query uses.\n  message: "
                + entry.Message);

        logs.Clear();
        var all = await client.SendAsync(Get("/d24/tickets", Token("zoe", role: "curator")));
        await Teach.Status(HttpStatusCode.OK, all, "A curator may read the whole museum.");
        Teach.Equal("1,2,3,4", await TicketIds(all),
            "...all four tickets, id ascending. The role widens the same query rather than "
                + "reaching a second endpoint.");
        Teach.Equal("4", Prop(Single(logs, "One entry for the curator's read."), "Count"),
            "...and the log entry counts what was actually returned.");
    }

    [Fact]
    public async Task Ex7_TheSame404ForMissingAndForForbidden()
    {
        using var host = new SqliteHost<D24Db>();
        var logs = new LogCapture();
        using var logged = Logged(host, logs);
        Seed(host);
        using var client = logged.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.PostAsync("/d24/tickets/1/cancel", null),
            "This exercise fuses AUTHORIZATION, EF CORE, PROBLEM DETAILS and LOGGING. No "
                + "token is a 401 - reread README ex7.");

        logs.Clear();
        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Post("/d24/tickets/1/cancel", Token("bo"))),
            "Ticket 1 is ada's. A 403 here would confirm that ticket 1 exists, which bo is not "
                + "entitled to know - an attacker can walk the id space and map the whole "
                + "database from nothing but the difference between 403 and 404.");
        Teach.Equal(LogLevel.Information, Single(logs, "One entry for the refusal.").Level,
            "...and somebody asking for a ticket that is not theirs is not an incident. "
                + "Logging it at Warning means the alert that fires on Warnings fires on other "
                + "people's typos, and within a month nobody reads it.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Post("/d24/tickets/99/cancel", Token("bo"))),
            "...and it has to be exactly as indistinguishable as an id that does not exist at "
                + "all. Two branches, one answer.");

        logs.Clear();
        var again = await client.SendAsync(Post("/d24/tickets/3/cancel", Token("ada")));
        await Teach.Status(HttpStatusCode.Conflict, again,
            "Ticket 3 is ada's own and was cancelled before this request arrived: 409, because "
                + "the request is well formed and the world says no.");
        Teach.Equal("application/problem+json", again.Content.Headers.ContentType?.MediaType,
            "...as problem details.");
        var problem = await again.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(D24Problems.Base + "already-cancelled", problem?.Type,
            "...under a type the client can branch on, distinct from ex5's sold-out.");
        Teach.Equal("/d24/tickets/3/cancel", problem?.Instance, "...naming the request.");
        var conflict = Single(logs, "One entry for the conflict.");
        Teach.Equal(LogLevel.Warning, conflict.Level,
            "THIS one is a Warning: the same shape of refusal as the 404 above and a "
                + "completely different meaning - somebody is retrying work that was already "
                + "done, and somebody may want to know how often. The level is a claim about "
                + "whose problem it is, not about the status code.\n" + logs.Dump());
        Teach.Equal("3", Prop(conflict, "TicketId"), "...with the ticket as a named property.");

        logs.Clear();
        var done = await client.SendAsync(Post("/d24/tickets/1/cancel", Token("ada")));
        await Teach.Status(HttpStatusCode.NoContent, done,
            "Her own live ticket: the cancellation succeeds and has nothing to say, so it says "
                + "it with 204.");
        Teach.Equal(0, (await done.Content.ReadAsByteArrayAsync()).Length,
            "...and 204 means NO content. A body here contradicts the status line.");
        Teach.Equal(true, host.Query(db => db.Tickets.Single(t => t.Id == 1).Cancelled),
            "...and the row really was written. Setting the property without SaveChangesAsync "
                + "changes a tracked object and nothing else.");
        Teach.Equal(LogLevel.Information, Single(logs, "One entry for the success.").Level,
            "...and a cancellation that worked is Information.");

        logs.Clear();
        await Teach.Status(HttpStatusCode.NoContent,
            await client.SendAsync(Post("/d24/tickets/4/cancel", Token("zoe", role: "curator"))),
            "Ticket 4 is cy's, and a curator may cancel anybody's - the same role that widened "
                + "the query in ex6.");
        Teach.Equal(true, host.Query(db => db.Tickets.Single(t => t.Id == 4).Cancelled),
            "...and that one is written too.");
        Teach.Equal(0, logs.FromApi.Count(e => e.Level >= LogLevel.Error),
            "Nothing in this endpoint is an Error. An Error means the server failed at "
                + "something it promised to do, and none of these outcomes is that.\n"
                + logs.Dump());
    }

    [Fact]
    public async Task Ex8_EveryTopicInThisTrackOnOneWrite()
    {
        using var host = new SqliteHost<D24Db>();
        var logs = new LogCapture();
        using var logged = Logged(host, logs);
        Seed(host);
        using var client = logged.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.PostAsJsonAsync("/d24/bookings", new { exhibitId = 1, holder = "dee", count = 1 }),
            "This exercise fuses EVERYTHING: policy authorization, options, collected "
                + "validation, EF Core, problem details and logging. No token is a 401 - "
                + "reread README ex8.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Post("/d24/bookings", Token("ada"),
                new { exhibitId = 1, holder = "dee", count = 1 })),
            "Ada proved who she is and is not a curator, so the answer is 403. A 401 would "
                + "tell her to authenticate, which she already did - and a client that handles "
                + "401 by refreshing its token will loop forever on it. The policy decides "
                + "this before the handler runs.");

        logs.Clear();
        var bad = await client.SendAsync(Post("/d24/bookings", Curator(),
            new { exhibitId = 0, holder = "   ", count = 0 }));
        await Teach.Status(HttpStatusCode.BadRequest, bad,
            "Three fields are wrong at once, and all three are answerable from the payload "
                + "alone, so nothing has been looked up yet.");
        var errors = await bad.Content.ReadFromJsonAsync<ValidationDto>();
        var keys = errors?.Errors is null
            ? ""
            : string.Join(",", errors.Errors.Keys.OrderBy(k => k, StringComparer.Ordinal));
        Teach.Equal("count,exhibitId,holder", keys,
            "All three keys, in ONE response. A caller who is told about one field at a time "
                + "learns your rules by trial and error, one round trip per rule.");
        Teach.Equal(D24Problems.Base + "invalid-request", errors?.Type,
            "...under this set's own problem type.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Post("/d24/bookings", Curator(),
                new { exhibitId = 99, holder = "dee", count = 1 })),
            "The payload is fine and exhibit 99 does not exist: 404. Validation first, then "
                + "the world.");

        logs.Clear();
        var short_ = await client.SendAsync(Post("/d24/bookings", Curator(),
            new { exhibitId = 1, holder = "dee", count = 2 }));
        await Teach.Status(HttpStatusCode.Conflict, short_,
            "Bronze Age has capacity 3 and two live tickets, so one seat is left and two were "
                + "asked for: 409, because nothing the client sent is malformed.");
        Teach.Equal(1, (await short_.Content.ReadFromJsonAsync<ProblemDto>())?.SeatsLeft,
            "...and seatsLeft says exactly how many there are, so the client can offer that "
                + "instead of asking again to find out.");
        Teach.Equal(LogLevel.Warning, Single(logs, "One entry for the refusal.").Level,
            "...and a booking the museum could not honour is a Warning.");
        Teach.Equal(4, host.Query(db => db.Tickets.Count()),
            "...and nothing was written. A partial booking is worse than no booking.");

        logs.Clear();
        var made = await client.SendAsync(Post("/d24/bookings", Curator(),
            new { exhibitId = 3, holder = "  dee  ", count = 3 }));
        await Teach.Status(HttpStatusCode.Created, made,
            "Deep Time has capacity 5, one live ticket and one cancelled one, so four seats "
                + "are left and three fit.");
        Teach.Equal("/d24/bookings/5", made.Headers.Location?.ToString(),
            "...and Location points at the booking, keyed by the first ticket created.");
        var booking = await made.Content.ReadFromJsonAsync<BookingReadDto>();
        Teach.Equal(5, booking?.Id, "Four tickets were seeded, so the first new one is 5.");
        Teach.Equal(3, booking?.ExhibitId, "...on exhibit 3...");
        Teach.Equal("dee", booking?.Holder,
            "...for \"dee\", trimmed. The value that was validated is the value that gets stored.");
        Teach.Equal("5,6,7", string.Join(",", booking?.TicketIds ?? []),
            "...and the body lists every ticket id it created, ascending, so the caller never "
                + "has to guess them.");
        Teach.Equal(7, host.Query(db => db.Tickets.Count()), "Four seeded plus three booked.");
        Teach.Equal("3:dee:1,3:dee:1,3:dee:1",
            host.Query(db => string.Join(",", db.Tickets.Where(t => t.Id >= 5).OrderBy(t => t.Id)
                .Select(t => t.ExhibitId + ":" + t.Holder + ":" + t.Day))),
            "...each one on the right exhibit, for the right holder, on day 1.");

        var entry = Single(logs, "Exactly one entry for the booking.");
        Teach.Equal(LogLevel.Information, entry.Level, "A booking that worked is Information.");
        Teach.Equal("3", Prop(entry, "Count"), "...carrying how many were booked, as a property...");
        Teach.True(!string.IsNullOrWhiteSpace(Prop(entry, "TraceId")),
            "...and the TraceId, which is the field that ties this line to the request a "
                + "support ticket is about. Without it the log is a pile of sentences nobody "
                + "can join to anything.\n" + logs.Dump());
    }

    // ... private helpers and DTO records, listed below ...
}
```

...where the helpers are `NewHost` and `Seed` (the museum, one private in-memory database per test), `Limited` (a second host whose configuration sets the ticket limit), `Logged` (the same host with a `LogCapture` in its logging pipeline), `Token`, `Curator`, `Get`, `Post` and `Authorized` (signed `d24-bearer` JWTs), `Single` and `Prop` (one log entry and its named properties) and `TicketIds`, followed by seven `private sealed record` DTOs.
