# d02 — Route group drills

Eight problems on `MapGroup`: prefixes, nesting, parameters in a prefix, and the
endpoint filters a group hangs on everything inside it. They drill lesson
**01_routing_endpoints** — go back to it if the group root and the group prefix
still feel like the same thing.

Everything lives under `/d02/…`. The data is five recipes in
`src/Api/D02_RouteGroups/Kitchen.cs`, plus the two filter types ex6 asks you to
arrange.

## Exercise 1 — one group, two endpoints

Edit `src/Api/D02_RouteGroups/Ex1.cs`. A group for `/d02/recipes` with:

- the group **root** — **200** with every recipe title, sorted A–Z
- `/{id:int}` — **200** with the whole recipe, **404** when there is none

```
uv run dojo test dotnet d02_route_groups ex1
```

## Exercise 2 — groups inside groups

Edit `src/Api/D02_RouteGroups/Ex2.cs`. A `/d02/admin` group holding two more:

- `/recipes` with `/count` on it — **200** with `{"count": …}`
- `/courses` with its own root — **200** with every course, distinct, sorted A–Z

Nothing else may answer. `/d02/recipes/count` and `/d02/admin/recipes` are both
**404**.

```
uv run dojo test dotnet d02_route_groups ex2
```

## Exercise 3 — a parameter in the prefix

Edit `src/Api/D02_RouteGroups/Ex3.cs`. A group whose prefix is
`/d02/courses/{course}`:

- the group root — **200** with that course's titles, sorted A–Z
- `/longest` — **200** with the title of that course's slowest recipe

A course no recipe has is a **404** at both.

```
uv run dojo test dotnet d02_route_groups ex3
```

## Exercise 4 — one filter for the whole group

Edit `src/Api/D02_RouteGroups/Ex4.cs`. Add **one** endpoint filter to the
`/d02/kitchen` group:

- no `X-Chef` request header → **401**, and the handler must not run
- otherwise → set the response header `X-Chef-Ack` to that chef's name and let
  the request through unchanged

Both endpoints are already mapped. Do not touch them.

```
uv run dojo test dotnet d02_route_groups ex4
```

## Exercise 5 — a filter that reads the handler's arguments

Edit `src/Api/D02_RouteGroups/Ex5.cs`. Add **one** endpoint filter to the
`/d02/pantry` group that rejects an `id` above **100** with a **400** before
either handler runs. Ids of 100 or less pass through untouched.

Both handlers take the id as their first parameter.

```
uv run dojo test dotnet d02_route_groups ex5
```

## Exercise 6 — the order they run in

Edit `src/Api/D02_RouteGroups/Ex6.cs`. Attach the given `ReportFilter` and three
`MarkFilter`s — named `a`, `b` and `c` — so that `GET /d02/trace/run` answers
with exactly:

```
a>,b>,c>,handler,c<,b<,a<
```

Two of the marks belong on the group and one belongs on the endpoint. The
`ReportFilter` has to see the finished trace.

```
uv run dojo test dotnet d02_route_groups ex6
```

## Exercise 7 — rewrite the result on the way out

Edit `src/Api/D02_RouteGroups/Ex7.cs`. Add **one** endpoint filter to the
`/d02/menu` group that wraps a `List<string>` result in an `Envelope`
(`{"items": [ … ], "count": …}`) and hands anything else back untouched.

`/d02/menu/health` does not return a list, and its body must come out exactly as
the handler wrote it.

```
uv run dojo test dotnet d02_route_groups ex7
```

## Exercise 8 — nested groups, and a filter each

Edit `src/Api/D02_RouteGroups/Ex8.cs`. Build this, in one method:

- a `/d02/v1` group whose filter answers **400** unless the request carries
  `X-Api-Version: 1`
- inside it, a `/kitchens/{kitchen}` group whose filter sets the response header
  `X-Kitchen-Checked: yes` and then answers **404** unless the kitchen is one of
  `Cookbook.Kitchens`
- `/recipes` — **200** with the titles that kitchen's courses cover, sorted A–Z
- `/recipes/{id:int}` — **200** with `{"title": …}` when that kitchen serves that
  recipe, **404** otherwise

When the version header is missing, the inner filter must never run.

```
uv run dojo test dotnet d02_route_groups ex8
```

## The gate

This is the entire gate class, `tests/Gates/D02_RouteGroupsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class D02_RouteGroupsTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_OneGroupCarriesThePrefixForBothEndpoints()
    {
        using var client = factory.CreateClient();

        var list = await client.GetAsync("/d02/recipes");
        await Teach.Status(HttpStatusCode.OK, list,
            "GET /d02/recipes must answer 200. A 404 means the list endpoint was mapped on "
                + "\"/recipes\" inside a group that already says \"/recipes\" - the group root "
                + "is the empty string. Reread README ex1.");
        Teach.Equal("Gyoza,Katsu curry,Matcha cake,Miso soup,Ramen", await Names(list),
            "Five titles, sorted A-Z.");

        var one = await client.GetAsync("/d02/recipes/2");
        await Teach.Status(HttpStatusCode.OK, one,
            "GET /d02/recipes/2 must answer 200 - the group prefix plus \"/{id:int}\" is the "
                + "whole template.");
        var recipe = await one.Content.ReadFromJsonAsync<RecipeDto>();
        Teach.Equal("Katsu curry", recipe?.Title, "Recipe 2 is the katsu curry.");
        Teach.Equal(45, recipe?.Minutes, "…and it takes 45 minutes. Return the whole record.");

        var missing = await client.GetAsync("/d02/recipes/99");
        await Teach.Status(HttpStatusCode.NotFound, missing, "There is no recipe 99: 404.");
    }

    [Fact]
    public async Task Ex2_GroupsInsideGroupsConcatenateTheirPrefixes()
    {
        using var client = factory.CreateClient();

        var count = await client.GetAsync("/d02/admin/recipes/count");
        await Teach.Status(HttpStatusCode.OK, count,
            "GET /d02/admin/recipes/count must answer 200. Three prefixes join up here: "
                + "/d02/admin + /recipes + /count - reread README ex2.");
        var body = await count.Content.ReadFromJsonAsync<CountDto>();
        Teach.Equal(5, body?.Count, "The cookbook holds five recipes.");

        var courses = await client.GetAsync("/d02/admin/courses");
        await Teach.Status(HttpStatusCode.OK, courses,
            "GET /d02/admin/courses must answer 200 - a second group under the same parent.");
        Teach.Equal("dessert,main,starter", await Names(courses),
            "Three courses, distinct and sorted A-Z.");

        var unprefixed = await client.GetAsync("/d02/recipes/count");
        await Teach.Status(HttpStatusCode.NotFound, unprefixed,
            "A nested group's endpoints exist only under the whole prefix chain. If this "
                + "answers 200, the inner group was hung off the application instead of off "
                + "the admin group.");

        var groupRoot = await client.GetAsync("/d02/admin/recipes");
        await Teach.Status(HttpStatusCode.NotFound, groupRoot,
            "Nothing is mapped on the inner group's own root, and a group with no endpoint at "
                + "a path does not answer there. A group is a prefix, not a resource.");
    }

    [Fact]
    public async Task Ex3_TheGroupPrefixCanCarryARouteParameter()
    {
        using var client = factory.CreateClient();

        var starters = await client.GetAsync("/d02/courses/starter");
        await Teach.Status(HttpStatusCode.OK, starters,
            "GET /d02/courses/starter must answer 200 - reread README ex3.");
        Teach.Equal("Gyoza,Miso soup", await Names(starters),
            "Two starters, sorted A-Z. The {course} in the GROUP prefix binds to the "
                + "handler's parameter exactly as it would in the endpoint's own template.");

        Teach.Equal("Matcha cake", await Names(await client.GetAsync("/d02/courses/dessert")),
            "One dessert.");

        var longest = await client.GetAsync("/d02/courses/main/longest");
        await Teach.Status(HttpStatusCode.OK, longest,
            "GET /d02/courses/main/longest must answer 200 - the same route value reaches the "
                + "second endpoint too.");
        Teach.Equal("\"Ramen\"", (await longest.Content.ReadAsStringAsync()).Trim(),
            "The slowest main is the ramen at 90 minutes.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d02/courses/pudding"),
            "No recipe is a pudding, so the course does not exist: 404.");
        await Teach.Status(HttpStatusCode.NotFound,
            await client.GetAsync("/d02/courses/pudding/longest"),
            "…and the same is true one level down.");
    }

    [Fact]
    public async Task Ex4_OneFilterOnTheGroupGuardsEveryEndpointInIt()
    {
        using var client = factory.CreateClient();

        var orders = await client.SendAsync(WithChef("/d02/kitchen/orders", "Ada"));
        await Teach.Status(HttpStatusCode.OK, orders,
            "GET /d02/kitchen/orders with an X-Chef header must answer 200 - reread README ex4.");
        Teach.Equal("orders", await orders.Content.ReadAsStringAsync(),
            "…and the handler's own body must still come back. A filter that returns its own "
                + "result instead of awaiting next replaces the endpoint rather than guarding it.");
        Teach.Equal("Ada", Header(orders, "X-Chef-Ack"),
            "The filter echoes the chef it accepted. An empty value here means the header was "
                + "read but never written back.");

        var status = await client.SendAsync(WithChef("/d02/kitchen/status", "Grace"));
        await Teach.Status(HttpStatusCode.OK, status, "The second endpoint behaves the same way…");
        Teach.Equal("Grace", Header(status, "X-Chef-Ack"),
            "…because the filter is on the GROUP. One line, every endpoint - and the next "
                + "endpoint someone adds is guarded by default.");

        var anonymous = await client.GetAsync("/d02/kitchen/orders");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No X-Chef header: 401.");
        Teach.Equal("", await anonymous.Content.ReadAsStringAsync(),
            "…and the handler must not have run. Returning a 401 and then awaiting next does "
                + "the work anyway, which is the opposite of guarding.");
    }

    [Fact]
    public async Task Ex5_AFilterCanReadTheArgumentsTheHandlerWouldHaveGot()
    {
        using var client = factory.CreateClient();

        var item = await client.GetAsync("/d02/pantry/7");
        await Teach.Status(HttpStatusCode.OK, item,
            "GET /d02/pantry/7 must answer 200 - reread README ex5.");
        Teach.Equal("item 7", await item.Content.ReadAsStringAsync(),
            "An id inside the range passes straight through.");

        var label = await client.GetAsync("/d02/pantry/7/label");
        Teach.Equal("label 7", await label.Content.ReadAsStringAsync(),
            "…on both endpoints.");

        var tooBig = await client.GetAsync("/d02/pantry/101");
        await Teach.Status(HttpStatusCode.BadRequest, tooBig,
            "101 is above the limit, so the filter refuses before the handler runs. This is a "
                + "400 and not a 404 because the id is well formed and out of range - a route "
                + "constraint could only have produced the 404.");

        var tooBigLabel = await client.GetAsync("/d02/pantry/101/label");
        await Teach.Status(HttpStatusCode.BadRequest, tooBigLabel,
            "…and the second endpoint is covered by the same one line, without knowing it.");
    }

    [Fact]
    public async Task Ex6_FiltersNestLikeAnOnionAroundTheHandler()
    {
        using var client = factory.CreateClient();

        var run = await client.GetAsync("/d02/trace/run");
        await Teach.Status(HttpStatusCode.OK, run,
            "GET /d02/trace/run must answer 200 - reread README ex6.");

        string trace = (await run.Content.ReadAsStringAsync()).Trim('"');
        Teach.Equal("a>,b>,c>,handler,c<,b<,a<", trace,
            "Group filters wrap endpoint filters, and within one builder the first one added "
                + "is the outermost. So the marks go in in the order you added them and come "
                + "back out in the reverse order - which is why \"a\" both starts and ends the "
                + "trace, and why \"c\" is the only one that touches the handler directly.");
    }

    [Fact]
    public async Task Ex7_AFilterCanRewriteTheResultOnTheWayOut()
    {
        using var client = factory.CreateClient();

        var starters = await client.GetAsync("/d02/menu/starters");
        await Teach.Status(HttpStatusCode.OK, starters,
            "GET /d02/menu/starters must answer 200 - reread README ex7.");

        var envelope = await starters.Content.ReadFromJsonAsync<EnvelopeDto>();
        Teach.Equal("Gyoza,Miso soup", Join(envelope?.Items),
            "The handler's list has to survive the wrapping, in its own order.");
        Teach.Equal(2, envelope?.Count,
            "…and the envelope reports how many there were. A 0 here means the filter built "
                + "the envelope before awaiting next, so it counted nothing.");

        var mains = await client.GetFromJsonAsync<EnvelopeDto>("/d02/menu/mains");
        Teach.Equal("Katsu curry,Ramen", Join(mains?.Items), "The second endpoint too…");
        Teach.Equal(2, mains?.Count, "…with its own count.");

        string health = await client.GetStringAsync("/d02/menu/health");
        Teach.Equal("\"ok\"", health.Trim(),
            "This handler does not return a list, so the filter must hand its result back "
                + "untouched. A filter that wraps everything it sees turns every unrelated "
                + "response - errors included - into a shape its clients did not ask for.");
    }

    [Fact]
    public async Task Ex8_TheOuterGroupsFilterRunsFirstAndCanStopEverything()
    {
        using var client = factory.CreateClient();

        var north = await client.SendAsync(Versioned("/d02/v1/kitchens/north/recipes"));
        await Teach.Status(HttpStatusCode.OK, north,
            "GET /d02/v1/kitchens/north/recipes with X-Api-Version: 1 must answer 200 - "
                + "reread README ex8.");
        Teach.Equal("Gyoza,Katsu curry,Miso soup,Ramen", await Names(north),
            "The north kitchen serves starters and mains, sorted A-Z.");

        var south = await client.SendAsync(Versioned("/d02/v1/kitchens/south/recipes"));
        Teach.Equal("Matcha cake", await Names(south), "The south kitchen serves desserts.");

        var dessert = await client.SendAsync(Versioned("/d02/v1/kitchens/south/recipes/4"));
        await Teach.Status(HttpStatusCode.OK, dessert, "Recipe 4 is a dessert, so south has it.");
        var title = await dessert.Content.ReadFromJsonAsync<TitleDto>();
        Teach.Equal("Matcha cake", title?.Title, "…and that is its title.");

        var notHere = await client.SendAsync(Versioned("/d02/v1/kitchens/south/recipes/1"));
        await Teach.Status(HttpStatusCode.NotFound, notHere,
            "Recipe 1 is a starter, which the south kitchen does not serve. The route value "
                + "from the group prefix has to narrow the lookup, not just decorate the URL.");

        var unknownKitchen = await client.SendAsync(Versioned("/d02/v1/kitchens/west/recipes"));
        await Teach.Status(HttpStatusCode.NotFound, unknownKitchen,
            "There is no west kitchen: the inner filter says 404.");
        Teach.Equal("yes", Header(unknownKitchen, "X-Kitchen-Checked"),
            "…and it got as far as running, which the header proves.");

        var unversioned = await client.GetAsync("/d02/v1/kitchens/north/recipes");
        await Teach.Status(HttpStatusCode.BadRequest, unversioned,
            "Without the version header the outer filter refuses: 400.");
        Teach.Equal("", Header(unversioned, "X-Kitchen-Checked"),
            "…and the INNER filter never ran, because the outer one returned without awaiting "
                + "next. Filters nest: the outermost one is the only one guaranteed to run.");
    }

    // … private helpers and DTO records, listed below …
}
```

…where the helpers are `WithChef` and `Versioned` (request builders), `Header`,
`Join` and `Names` (small readers over the response), plus four
`private sealed record` DTOs.
