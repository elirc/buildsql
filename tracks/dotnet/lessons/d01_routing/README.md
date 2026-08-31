# d01 — Routing drills

Eight problems on route templates: parameters, constraints, verbs, optional
segments, catch-alls, precedence, link generation and binding sources. They
drill lesson **01_routing_endpoints** — redo that one first if this set feels
like guessing rather than recalling.

Every endpoint lives under `/d01/…` and every answer comes from
`src/Api/D01_Routing/Network.cs`: five stops, six departures, three lines. Read
that file once and you never have to read it again.

## Exercise 1 — one stop, by id

Edit `src/Api/D01_Routing/Ex1.cs`. `GET /d01/stops/{id:int}` answers **200**
with the stop that has that id, **404** when the network has no such stop. The
`{id:int}` constraint stays where it is.

```
uv run dojo test dotnet d01_routing ex1
```

## Exercise 2 — two parameters, one constraint

Edit `src/Api/D01_Routing/Ex2.cs`. `GET /d01/departures/{line}/{hour}` answers
**200** with a JSON array of the destinations leaving on that line at that
hour, sorted A–Z.

A line the network does not run is a **404**. A line that runs but has nothing
at that hour is a **200 with an empty array** — those are different claims.
`hour` is constrained to `range(0,23)`; leave it constrained and notice what
that does to hour 24.

```
uv run dojo test dotnet d01_routing ex2
```

## Exercise 3 — the verb is half of the route

Edit `src/Api/D01_Routing/Ex3.cs`. Map exactly two endpoints on
`/d01/stops/{id:int}/watch`: **PUT** and **DELETE**, both **204** when the stop
exists and **404** when it does not.

Map nothing else there. What the framework then does about `POST` and `GET` is
the point of the exercise.

```
uv run dojo test dotnet d01_routing ex3
```

## Exercise 4 — an optional segment

Edit `src/Api/D01_Routing/Ex4.cs`. `GET /d01/lines/{line}/timetable/{day?}`
answers **200** with `{"line": …, "day": …, "hours": [ … ]}` where `hours` is
that line's departure hours, distinct and ascending.

`day` defaults to `weekday`. `weekend` drops every hour before 09:00. Any other
day is a **400**. A line the network does not run is a **404**.

```
uv run dojo test dotnet d01_routing ex4
```

## Exercise 5 — the catch-all

Edit `src/Api/D01_Routing/Ex5.cs`. `GET /d01/tiles/…` answers **200** with
`{"path": …, "segments": …}` for *any* number of trailing segments, including
none: `/d01/tiles/a/b/c.png` is `"a/b/c.png"` and 3, `/d01/tiles` is `""` and 0.

The template as shipped only matches one segment. Two characters fix that.

```
uv run dojo test dotnet d01_routing ex5
```

## Exercise 6 — literal beats parameter

Edit `src/Api/D01_Routing/Ex6.cs`. Two endpoints under `/d01/zones`:

- `GET /d01/zones/all` — **200** with every zone, distinct and sorted A–Z
- `GET /d01/zones/{zone}` — **200** with the names of that zone's stops, sorted
  A–Z; **404** when no stop is in it

The parameterised one is registered first on purpose. Leave it that way.

```
uv run dojo test dotnet d01_routing ex6
```

## Exercise 7 — name a route, then generate its URL

Edit `src/Api/D01_Routing/Ex7.cs`. Give `GET /d01/routes/{id:int}` the name
`Ex7.RouteName` and have it answer **200** with `{"id": …, "line": …}` (route 1
is `Network.Lines[0]`), **404** otherwise.

Then `GET /d01/routes/{id:int}/link` answers **200** with
`{"self": …, "next": …}`, both produced by the injected `LinkGenerator` from
that *name*, never by concatenating strings. `next` is `null` for the last
route. **404** when there is no such route.

```
uv run dojo test dotnet d01_routing ex7
```

## Exercise 8 — say where each parameter comes from

Edit `src/Api/D01_Routing/Ex8.cs`. `GET /d01/search/{scope}` answers **200**
with `{"scope": …, "term": …, "zone": …, "matches": [ … ]}`.

- `scope` comes from the route and is `stops` or `lines`; anything else is a
  **400**
- `term` comes from the query parameter **`q`** — not from one called `term`
- `zone` comes from the **`X-Zone`** request header, narrows stops to that zone,
  and is ignored for lines
- `term` keeps names containing it, case-insensitively; no term keeps
  everything; `matches` is sorted A–Z

```
uv run dojo test dotnet d01_routing ex8
```

## The gate

This is the entire gate class, `tests/Gates/D01_RoutingTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class D01_RoutingTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_TheIdInThePathSelectsTheStop()
    {
        using var client = factory.CreateClient();

        var found = await client.GetAsync("/d01/stops/3");
        await Teach.Status(HttpStatusCode.OK, found,
            "GET /d01/stops/3 must answer 200 with stop 3 - reread README ex1.");

        var stop = await found.Content.ReadFromJsonAsync<StopDto>();
        Teach.Equal("Parkway", stop?.Name,
            "Stop 3 is Parkway. Seeing Central for every id means the {id} route value never "
                + "reached the query.");
        Teach.Equal("C", stop?.Zone, "…and it is in zone C. Return the whole stop record.");

        var first = await client.GetFromJsonAsync<StopDto>("/d01/stops/1");
        Teach.Equal("Central", first?.Name,
            "Stop 1 is Central - a hard-coded stop passes the first check and fails here.");

        var missing = await client.GetAsync("/d01/stops/99");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "There is no stop 99: 404, not a 200 carrying null and not a 500.");

        var notANumber = await client.GetAsync("/d01/stops/CEN");
        await Teach.Status(HttpStatusCode.NotFound, notANumber,
            "The {id:int} constraint means \"CEN\" never matches this template, so routing "
                + "answers 404 before your handler exists. Leave the constraint in.");
    }

    [Fact]
    public async Task Ex2_TwoRouteParametersAndAConstraintThatRejects()
    {
        using var client = factory.CreateClient();

        var morning = await client.GetAsync("/d01/departures/N1/7");
        await Teach.Status(HttpStatusCode.OK, morning,
            "GET /d01/departures/N1/7 must answer 200 - reread README ex2.");
        Teach.Equal("Airport,Harbour", await Names(morning),
            "N1 leaves for Airport and Harbour at 07:00, sorted A-Z. Both route values have "
                + "to filter: one of them alone gives you too much.");

        Teach.Equal("Central", await Names(await client.GetAsync("/d01/departures/S2/18")),
            "S2 has one 18:00 departure, for Central.");

        var quiet = await client.GetAsync("/d01/departures/N1/12");
        await Teach.Status(HttpStatusCode.OK, quiet,
            "N1 is a line the network runs, so midday is a 200 - the resource exists and is "
                + "empty. A 404 would claim the line does not exist.");
        Teach.Equal("", await Names(quiet), "…with an empty array.");

        var noLine = await client.GetAsync("/d01/departures/X9/7");
        await Teach.Status(HttpStatusCode.NotFound, noLine,
            "There is no line X9, and that is the case that really is a 404.");

        var badHour = await client.GetAsync("/d01/departures/N1/24");
        await Teach.Status(HttpStatusCode.NotFound, badHour,
            "range(0,23) rejects hour 24 in routing, so the request never becomes a candidate "
                + "for this endpoint: 404. A constraint is a matching rule, not a validator - "
                + "it cannot produce a 400.");
    }

    [Fact]
    public async Task Ex3_TheVerbIsPartOfTheRoute()
    {
        using var client = factory.CreateClient();

        var watch = await client.PutAsync("/d01/stops/2/watch", null);
        await Teach.Status(HttpStatusCode.NoContent, watch,
            "PUT /d01/stops/2/watch must answer 204 - reread README ex3.");

        var unwatch = await client.DeleteAsync("/d01/stops/2/watch");
        await Teach.Status(HttpStatusCode.NoContent, unwatch,
            "…and DELETE on the same path is a second endpoint, also 204.");

        var missing = await client.PutAsync("/d01/stops/99/watch", null);
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "Stop 99 does not exist, so there is nothing to watch: 404.");

        var posted = await client.PostAsync("/d01/stops/2/watch", null);
        await Teach.Status(HttpStatusCode.MethodNotAllowed, posted,
            "Nothing maps POST on that path, but something maps the path, so routing answers "
                + "405 Method Not Allowed for free. A 404 here means you mapped the path with "
                + "MapMethods or Map and accepted every verb.");

        var got = await client.GetAsync("/d01/stops/2/watch");
        await Teach.Status(HttpStatusCode.MethodNotAllowed, got,
            "…and so is GET. Two verbs are mapped, and only two.");
    }

    [Fact]
    public async Task Ex4_AnOptionalSegmentFallsBackToADefault()
    {
        using var client = factory.CreateClient();

        var implied = await client.GetAsync("/d01/lines/N1/timetable");
        await Teach.Status(HttpStatusCode.OK, implied,
            "GET /d01/lines/N1/timetable must answer 200 - the {day?} segment is optional, so "
                + "the URL without it still matches. Reread README ex4.");

        var weekday = await implied.Content.ReadFromJsonAsync<TimetableDto>();
        Teach.Equal("weekday", weekday?.Day,
            "An absent optional segment binds to null, and null is where your default goes.");
        Teach.Equal("7,9", Hours(weekday),
            "N1 runs at 07:00 and 09:00, distinct and ascending.");

        var weekend = await client.GetFromJsonAsync<TimetableDto>("/d01/lines/N1/timetable/weekend");
        Teach.Equal("weekend", weekend?.Day, "The segment, when present, wins over the default.");
        Teach.Equal("9", Hours(weekend),
            "The weekend timetable drops everything before 09:00, so N1's 07:00 goes.");

        var otherLine = await client.GetFromJsonAsync<TimetableDto>("/d01/lines/S2/timetable/weekend");
        Teach.Equal("18", Hours(otherLine),
            "S2 runs at 07:00 and 18:00; on the weekend only the 18:00 survives.");

        var nonsense = await client.GetAsync("/d01/lines/N1/timetable/tuesday");
        await Teach.Status(HttpStatusCode.BadRequest, nonsense,
            "\"tuesday\" is a value your handler received and refused, which is a 400 - unlike "
                + "ex2's constraint, where routing refused to call you at all.");

        var noLine = await client.GetAsync("/d01/lines/X9/timetable");
        await Teach.Status(HttpStatusCode.NotFound, noLine, "There is no line X9: 404.");
    }

    [Fact]
    public async Task Ex5_TheCatchAllKeepsTheSlashes()
    {
        using var client = factory.CreateClient();

        var deep = await client.GetAsync("/d01/tiles/a/b/c.png");
        await Teach.Status(HttpStatusCode.OK, deep,
            "GET /d01/tiles/a/b/c.png must answer 200. A 404 means the template still stops at "
                + "one segment - reread README ex5.");

        var tile = await deep.Content.ReadFromJsonAsync<TileDto>();
        Teach.Equal("a/b/c.png", tile?.Path,
            "A catch-all binds the whole remainder, slashes and all - that is the only route "
                + "parameter that ever contains a /.");
        Teach.Equal(3, tile?.Segments, "…which is three segments.");

        var one = await client.GetFromJsonAsync<TileDto>("/d01/tiles/z");
        Teach.Equal("z", one?.Path, "One segment still matches a catch-all.");
        Teach.Equal(1, one?.Segments, "…and counts as one.");

        var none = await client.GetAsync("/d01/tiles");
        await Teach.Status(HttpStatusCode.OK, none,
            "A catch-all also matches zero segments, so the bare prefix is a 200.");
        var empty = await none.Content.ReadFromJsonAsync<TileDto>();
        Teach.Equal("", empty?.Path, "…with an empty path, not null.");
        Teach.Equal(0, empty?.Segments, "…and no segments.");
    }

    [Fact]
    public async Task Ex6_ALiteralSegmentBeatsAParameter()
    {
        using var client = factory.CreateClient();

        var all = await client.GetAsync("/d01/zones/all");
        await Teach.Status(HttpStatusCode.OK, all,
            "GET /d01/zones/all must answer 200 - reread README ex6.");
        Teach.Equal("A,B,C", await Names(all),
            "Three zones, distinct and sorted. Getting a 404 here means \"all\" was swallowed "
                + "by the {zone} template and treated as the name of a zone - which is exactly "
                + "what routing is supposed to stop happening, whichever order you registered "
                + "the two in.");

        Teach.Equal("Harbour,Riverside", await Names(await client.GetAsync("/d01/zones/B")),
            "Zone B holds Harbour and Riverside, sorted A-Z.");
        Teach.Equal("Central,Market", await Names(await client.GetAsync("/d01/zones/A")),
            "…and zone A holds Central and Market.");

        var nobody = await client.GetAsync("/d01/zones/Z");
        await Teach.Status(HttpStatusCode.NotFound, nobody,
            "No stop is in zone Z, so the zone does not exist: 404 rather than an empty 200.");
    }

    [Fact]
    public async Task Ex7_ANamedEndpointCanHaveItsUrlGenerated()
    {
        using var client = factory.CreateClient();

        var route = await client.GetAsync("/d01/routes/2");
        await Teach.Status(HttpStatusCode.OK, route,
            "GET /d01/routes/2 must answer 200 - reread README ex7.");
        var info = await route.Content.ReadFromJsonAsync<RouteDto>();
        Teach.Equal("S2", info?.Line, "Route 2 is the second line in service order, S2.");

        var links = await client.GetAsync("/d01/routes/2/link");
        await Teach.Status(HttpStatusCode.OK, links,
            "GET /d01/routes/2/link must answer 200. A 500 here usually means "
                + "GetPathByName returned null because no endpoint carries that name - "
                + "WithName is what makes a route addressable.");

        var body = await links.Content.ReadFromJsonAsync<LinksDto>();
        Teach.Equal("/d01/routes/2", body?.Self,
            "The generator builds the URL from the template and the values you hand it, so "
                + "the template can change without this code changing.");
        Teach.Equal("/d01/routes/3", body?.Next, "…and route 3 is the next one along.");

        var last = await client.GetFromJsonAsync<LinksDto>("/d01/routes/3/link");
        Teach.Equal("/d01/routes/3", last?.Self, "Route 3 is the last line the network runs…");
        Teach.Equal(null, last?.Next,
            "…so there is no next link. Omitting the link is how a client learns it has "
                + "reached the end; a URL to a 404 is not.");

        var missing = await client.GetAsync("/d01/routes/9/link");
        await Teach.Status(HttpStatusCode.NotFound, missing, "There is no route 9: 404.");
    }

    [Fact]
    public async Task Ex8_EachParameterSaysWhereItComesFrom()
    {
        using var client = factory.CreateClient();

        var everything = await client.GetAsync("/d01/search/stops");
        await Teach.Status(HttpStatusCode.OK, everything,
            "GET /d01/search/stops must answer 200 - reread README ex8.");
        Teach.Equal("Central,Harbour,Market,Parkway,Riverside", await Matches(everything),
            "No term and no zone header means every stop, sorted A-Z.");

        var filtered = await client.GetAsync("/d01/search/stops?q=ar");
        var body = await filtered.Content.ReadFromJsonAsync<SearchDto>();
        Teach.Equal("ar", body?.Term,
            "The query parameter is spelled q and the C# parameter is called term, so the "
                + "binding needs a name. Null here means the parameter bound to a query "
                + "parameter called \"term\", which nobody sent.");
        Teach.Equal("Harbour,Market,Parkway", Join(body?.Matches),
            "Harbour, Market and Parkway contain \"ar\"; Central and Riverside do not.");

        var wrongName = await client.GetAsync("/d01/search/stops?term=ar");
        Teach.Equal("Central,Harbour,Market,Parkway,Riverside", await Matches(wrongName),
            "?term=ar must do nothing at all. If it filters, the parameter is still binding "
                + "by its C# name and the q above was a coincidence.");

        var zoned = new HttpRequestMessage(HttpMethod.Get, "/d01/search/stops?q=ar");
        zoned.Headers.Add("X-Zone", "A");
        var inZoneA = await client.SendAsync(zoned);
        Teach.Equal("Market", await Matches(inZoneA),
            "Of the three \"ar\" stops only Market is in zone A. A header is not a query "
                + "parameter and does not bind unless you say so.");

        var lines = await client.GetAsync("/d01/search/lines?q=n");
        Teach.Equal("N1", await Matches(lines),
            "Searching lines for \"n\" finds N1, and the match is case-insensitive.");

        var nonsense = await client.GetAsync("/d01/search/banana");
        await Teach.Status(HttpStatusCode.BadRequest, nonsense,
            "\"banana\" is not a scope this endpoint has: 400.");
    }

    // … private helpers and DTO records, listed below …
}
```

…where the helpers are `Join`, `Names`, `Matches` and `Hours` (small readers
over the JSON body) and six `private sealed record` DTOs.
