# 01 — Routing and endpoints

Lesson 00's three endpoints were three separate facts: a path, a handler, a
response. A real API is not a bag of facts, it is a *resource* — a set of
routes that share a prefix, a shape and a vocabulary, so that a client who has
learned `GET /orders/3` can guess `POST /orders` without reading your docs.
This lesson is about the machinery that makes that possible, and about the part
nobody teaches: choosing the status code that tells the truth.

The dataset is five orders and three products, sitting in a static list in
`src/Api/L01_RoutingEndpoints/Catalog.cs`. Read it before you start — every
expected value in this lesson comes from that file, and there is no database in
the way yet:

```
Id  Customer  Status      TotalCents
1   Ada       shipped     4200
2   Grace     pending     1999
3   Ada       shipped     15000
4   Linus     cancelled   800
5   Grace     shipped     2500
```

## Concept — the route template, the constraint, and the result

A route template is a pattern with holes in it:

```csharp
app.MapGet("/l01/example/{id:int}", Example);

private static IResult Example(int id) => TypedResults.Ok(new { youAsked = id });
```

`{id:int}` declares a **route parameter** named `id` with an `int`
**constraint**. Two things follow from that, and both matter.

First, the parameter arrives in your handler already parsed. You wrote
`int id`, not `string id` plus a `TryParse` — routing matched the name and the
type did the rest.

Second, and less obvious: a request to `/l01/example/banana` does not reach
your handler at all. The constraint is part of *matching*, so there is simply
no route for that URL, and routing answers **404**. That surprises people who
expect a 400. Think of it this way: a constraint says "this route is only for
integers", not "this route validates integers". `{id:int:min(1)}`,
`{code:guid}`, `{slug:alpha}` and `{name:length(1,50)}` all work the same way,
and you use them in the challenge.

Routes that share a prefix go in a **group**:

```csharp
var group = app.MapGroup("/l01/example/widgets");
group.MapGet("", ListWidgets);            // GET /l01/example/widgets
group.MapGet("/{id:int}", GetWidget);     // GET /l01/example/widgets/3
group.MapPost("", CreateWidget);          // POST /l01/example/widgets
```

Note `""` for the group's own root: the group already contributed the prefix,
so the child pattern adds nothing. Groups are not only tidiness — anything you
attach to the group (authorisation, filters, OpenAPI metadata) applies to every
endpoint inside it, which is how lesson 09 secures a whole resource in one
line.

Finally, the results. You met `Ok` and `BadRequest` in lesson 00; here is the
rest of the working vocabulary:

| helper | status | when |
|---|---|---|
| `TypedResults.Ok(value)` | 200 | here is what you asked for |
| `TypedResults.Created(uri, value)` | 201 | I made something; it lives at `uri` |
| `TypedResults.NoContent()` | 204 | done, and there is nothing to say |
| `TypedResults.BadRequest()` | 400 | *your* request was malformed |
| `TypedResults.NotFound()` | 404 | no such thing |
| `TypedResults.Conflict()` | 409 | the request is fine, the current state forbids it |

A handler that can return more than one of these can say so in its signature:

```csharp
private static Results<Ok<Widget>, NotFound> GetWidget(int id) =>
    Store.Find(id) is { } widget ? TypedResults.Ok(widget) : TypedResults.NotFound();
```

`Results<A, B>` is a union type. The compiler now checks that you only return
one of the two shapes you promised, and ASP.NET Core can describe both in
OpenAPI without running your code. `IResult` on its own gives up both benefits;
use it when a handler really has four or five outcomes and the union stops
being readable — as it does in this lesson's challenge.

## Exercise 1 — a route parameter, and an honest 404

Edit `src/Api/L01_RoutingEndpoints/Ex1.cs`. Implement `GetOrder` so that
`GET /l01/orders/{id}` answers **200** with the matching order from
`Catalog.Orders`, and **404** when no order has that id.

The JSON body is the `Order` record as-is:
`{"id":3,"customer":"Ada","status":"shipped","totalCents":15000}`.

Leave the `{id:int}` constraint on the route template — the gate checks that
`/l01/orders/banana` gives a 404 from routing rather than a 500 from your code.

```
uv run dojo test dotnet 01_routing_endpoints ex1
```

## Exercise 2 — a route group

Edit `src/Api/L01_RoutingEndpoints/Ex2.cs`. Nothing is mapped in that file yet,
so both of its routes currently 404. Create a group for `/l01/customers` and
map two endpoints onto it:

- `GET /l01/customers` → **200** with every distinct customer name in
  `Catalog.Orders`, sorted A–Z: `["Ada","Grace","Linus"]`. Ada has two orders
  and must appear once.
- `GET /l01/customers/{name}/orders` → **200** with that customer's orders, id
  ascending. A name nobody has ordered under is **404**, not an empty list —
  the customer does not exist, and saying "here are Zoe's zero orders" invents
  a Zoe.

Both handlers are already declared for you; you write the two mapping lines and
the two bodies.

```
uv run dojo test dotnet 01_routing_endpoints ex2
```

## Exercise 3 — 201, and where the new thing lives

Edit `src/Api/L01_RoutingEndpoints/Ex3.cs`. Implement `CreateOrder` so that
`POST /l01/orders` with a body of `{"customer":"Ada","totalCents":500}` answers:

- **201 Created**
- a `Location` header of `/l01/orders/6`
- a body that is the new order: id 6, the customer from the request, status
  `"pending"`, and the requested `totalCents`

`Catalog.NextOrderId` gives you 6. Nothing is persisted — this lesson has no
store, and lesson 07 fixes that — so a second POST also produces 6, which is
fine.

A blank customer, or a `totalCents` that is not positive, is **400**.

The status the client sends, if any, is ignored: a new order is always
`"pending"`. Letting a caller choose the initial state of a resource is one of
the most common holes in a young API.

```
uv run dojo test dotnet 01_routing_endpoints ex3
```

## Exercise 4 — optional query parameters and a typed union

Edit `src/Api/L01_RoutingEndpoints/Ex4.cs`. Implement `SearchOrders` behind
`GET /l01/orders`, with two optional query parameters:

- `status` filters to orders with that status. Valid values are the three in
  `Catalog.Statuses`.
- `sort` is either `id` (the default) or `total`, meaning `totalCents`
  ascending.

So `/l01/orders` returns all five, id ascending; `?status=shipped` returns 1, 3
and 5; `?status=shipped&sort=total` returns 5, 1, 3. Filter first, then sort.

An unknown `status` or `sort` value is **400**, and the body must name the
value you rejected — `unknown status 'banana'` is enough. The signature is
already a `Results<Ok<List<Order>>, BadRequest<string>>`, so the compiler will
hold you to exactly those two outcomes.

Both parameters are `string?`. `null` means "the client did not send it", which
is a different thing from "the client sent something I do not understand" —
one is the default, the other is a 400.

```
uv run dojo test dotnet 01_routing_endpoints ex4
```

## Challenge — four status codes, one decision

Honest difficulty note: the code is short; getting the *order of the checks*
right is the whole problem.

Edit `src/Api/L01_RoutingEndpoints/Challenge.cs`. Implement `ChangeStatus`
behind `PUT /l01/orders/{id:int:min(1)}/status`, with a body of
`{"status":"shipped"}`:

- no order with that id → **404**
- a status that is not in `Catalog.Statuses` → **400**
- the order is currently `"cancelled"` → **409 Conflict**
- otherwise → **204 No Content**, with no body at all

409 is the code most APIs never learn. It means: I understood you, the resource
is there, and the *current state* makes this impossible. A cancelled order
cannot be shipped, and answering 400 would tell the client to fix their
request, which they cannot — there is nothing wrong with it.

Note also what the route constraint is doing: `min(1)` means `/l01/orders/0/status`
matches no route and gets a 404 without your handler running.

```
uv run dojo test dotnet 01_routing_endpoints challenge
```

## Review

`review1` is not part of finishing this lesson; the spaced-review scheduler
brings it back days later. Edit `src/Api/L01_RoutingEndpoints/Review1.cs` and
implement the two product endpoints — `GET /l01/review/products` (all
products, cheapest first) and `GET /l01/review/products/{sku}` (200 or 404).
Same ideas, different data.

## The gate

This is the entire gate class, `tests/Gates/L01_RoutingEndpointsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class L01_RoutingEndpointsTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_OrderByIdIsFoundOrHonestlyMissing()
    {
        using var client = factory.CreateClient();

        var found = await client.GetAsync("/l01/orders/3");
        await Teach.Status(HttpStatusCode.OK, found,
            "GET /l01/orders/3 must answer 200 with order 3 - reread README ex1.");

        var order = await found.Content.ReadFromJsonAsync<OrderDto>();
        Teach.Equal("Ada", order?.Customer,
            "The {id} route parameter has to select the order. Order 3 belongs to Ada; "
                + "if you see Ada for every id, you are returning the first one.");
        Teach.Equal(15000, order?.TotalCents,
            "Order 3's totalCents is 15000. Return the whole order record, not a rebuilt subset.");

        var first = await client.GetAsync("/l01/orders/1");
        var firstOrder = await first.Content.ReadFromJsonAsync<OrderDto>();
        Teach.Equal(4200, firstOrder?.TotalCents,
            "Order 1's totalCents is 4200 - a hard-coded order passes the first check "
                + "and fails this one.");

        var missing = await client.GetAsync("/l01/orders/99");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "There is no order 99. That is a 404, not a 200 with null and not a 500.");

        var notANumber = await client.GetAsync("/l01/orders/banana");
        await Teach.Status(HttpStatusCode.NotFound, notANumber,
            "The {id:int} constraint means 'banana' never matches this route at all, "
                + "so routing answers 404 before your handler runs. Leave the constraint in.");
    }

    [Fact]
    public async Task Ex2_CustomerRoutesLiveUnderOneGroup()
    {
        using var client = factory.CreateClient();

        var list = await client.GetAsync("/l01/customers");
        await Teach.Status(HttpStatusCode.OK, list,
            "GET /l01/customers must answer 200. A 404 means the group root is not mapped - "
                + "map ListCustomers on \"\" inside the group, not on \"/customers\" again.");

        var names = await list.Content.ReadFromJsonAsync<List<string>>();
        Teach.Equal("Ada,Grace,Linus", string.Join(",", names ?? []),
            "Distinct customer names, sorted A-Z. Ada has two orders and must appear once.");

        var ada = await client.GetAsync("/l01/customers/Ada/orders");
        await Teach.Status(HttpStatusCode.OK, ada,
            "GET /l01/customers/Ada/orders must answer 200 - the group prefix plus "
                + "\"/{name}/orders\" is the whole route.");

        Teach.Equal("1,3", await Ids(ada),
            "Ada owns orders 1 and 3, id ascending.");

        var grace = await client.GetAsync("/l01/customers/Grace/orders");
        Teach.Equal("2,5", await Ids(grace),
            "Grace owns orders 2 and 5 - the {name} parameter has to do the filtering.");

        var nobody = await client.GetAsync("/l01/customers/Zoe/orders");
        await Teach.Status(HttpStatusCode.NotFound, nobody,
            "Nobody called Zoe has ever ordered, so that customer does not exist: 404, "
                + "not an empty 200.");
    }

    [Fact]
    public async Task Ex3_CreatingAnOrderAnswers201WithALocation()
    {
        using var client = factory.CreateClient();

        var created = await client.PostAsJsonAsync("/l01/orders",
            new { customer = "Ada", totalCents = 500 });

        await Teach.Status(HttpStatusCode.Created, created,
            "A successful POST that made a new resource is 201 Created, not 200 OK - "
                + "reread README ex3.");

        Teach.Equal("/l01/orders/6", created.Headers.Location?.ToString(),
            "201 without a Location header is half an answer: the client has no idea "
                + "where the thing it just made now lives. The next free id is 6.");

        var body = await created.Content.ReadFromJsonAsync<OrderDto>();
        Teach.Equal(6, body?.Id,
            "The body is the created order, and its id is the one in the Location header.");
        Teach.Equal("Ada", body?.Customer,
            "The customer comes from the request body.");
        Teach.Equal("pending", body?.Status,
            "A brand new order starts as \"pending\" - the client does not get to choose.");

        var blank = await client.PostAsJsonAsync("/l01/orders",
            new { customer = "   ", totalCents = 500 });
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A blank customer is a malformed request: 400.");

        var free = await client.PostAsJsonAsync("/l01/orders",
            new { customer = "Ada", totalCents = 0 });
        await Teach.Status(HttpStatusCode.BadRequest, free,
            "totalCents must be positive, so 0 is a 400. Check it as well as the customer.");
    }

    [Fact]
    public async Task Ex4_SearchFiltersSortsAndRejects()
    {
        using var client = factory.CreateClient();

        var all = await client.GetAsync("/l01/orders");
        await Teach.Status(HttpStatusCode.OK, all,
            "Both query parameters are optional: no query string means every order.");
        Teach.Equal("1,2,3,4,5", await Ids(all),
            "With no filter and no sort you return all five orders, id ascending.");

        var shipped = await client.GetAsync("/l01/orders?status=shipped");
        Teach.Equal("1,3,5", await Ids(shipped),
            "Orders 1, 3 and 5 are shipped, and the default order is still id ascending.");

        var sorted = await client.GetAsync("/l01/orders?status=shipped&sort=total");
        Teach.Equal("5,1,3", await Ids(sorted),
            "sort=total means totalCents ascending: 2500, 4200, 15000 - and the filter "
                + "still applies. Filter first, then sort.");

        var badStatus = await client.GetAsync("/l01/orders?status=banana");
        await Teach.Status(HttpStatusCode.BadRequest, badStatus,
            "\"banana\" is not one of Catalog.Statuses. An unknown filter value is a 400, "
                + "not a silently empty list.");
        string badBody = await badStatus.Content.ReadAsStringAsync();
        Teach.True(badBody.Contains("banana"),
            "Say what was wrong: the 400 body should name the value you rejected. "
                + $"Got: {badBody}");

        var badSort = await client.GetAsync("/l01/orders?sort=sideways");
        await Teach.Status(HttpStatusCode.BadRequest, badSort,
            "Only \"id\" and \"total\" are sortable, so sort=sideways is a 400 too.");
    }

    [Fact]
    public async Task Challenge_StatusChangesPickOneOfFourCodes()
    {
        using var client = factory.CreateClient();

        var ok = await client.PutAsJsonAsync("/l01/orders/2/status", new { status = "shipped" });
        await Teach.Status(HttpStatusCode.NoContent, ok,
            "A successful status change has nothing to say, so it is 204 No Content - "
                + "not 200 with an empty body.");
        Teach.Equal("", await ok.Content.ReadAsStringAsync(),
            "204 means no content: do not write a body.");

        var missing = await client.PutAsJsonAsync("/l01/orders/99/status", new { status = "shipped" });
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "Order 99 does not exist: 404.");

        var nonsense = await client.PutAsJsonAsync("/l01/orders/2/status", new { status = "banana" });
        await Teach.Status(HttpStatusCode.BadRequest, nonsense,
            "\"banana\" is not a status this system has: 400.");

        var cancelled = await client.PutAsJsonAsync("/l01/orders/4/status", new { status = "shipped" });
        await Teach.Status(HttpStatusCode.Conflict, cancelled,
            "Order 4 is cancelled. The request is well formed and the order exists, but the "
                + "state forbids it - that is 409 Conflict, the code most APIs forget.");

        var belowMinimum = await client.PutAsJsonAsync("/l01/orders/0/status", new { status = "shipped" });
        await Teach.Status(HttpStatusCode.NotFound, belowMinimum,
            "The {id:int:min(1)} constraint means id 0 never reaches your handler: 404 from "
                + "routing itself.");
    }

    [Fact]
    public async Task Review1_ProductRoutesRepeatTheIdea()
    {
        using var client = factory.CreateClient();

        var list = await client.GetAsync("/l01/review/products");
        await Teach.Status(HttpStatusCode.OK, list,
            "GET /l01/review/products must answer 200 with every product.");

        var products = await list.Content.ReadFromJsonAsync<List<ProductDto>>();
        Teach.Equal("dojo-01,dojo-03,dojo-02",
            string.Join(",", (products ?? []).Select(p => p.Sku)),
            "Cheapest first: 3400, 5900, 12500. Sort by priceCents, not by sku.");

        var one = await client.GetAsync("/l01/review/products/dojo-03");
        await Teach.Status(HttpStatusCode.OK, one, "dojo-03 exists, so this is a 200.");
        var product = await one.Content.ReadFromJsonAsync<ProductDto>();
        Teach.Equal("Bokken", product?.Name,
            "The {sku} route parameter selects the product.");

        var missing = await client.GetAsync("/l01/review/products/dojo-99");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "No product has sku dojo-99: 404.");
    }

    private static async Task<string> Ids(HttpResponseMessage response)
    {
        var orders = await response.Content.ReadFromJsonAsync<List<OrderDto>>();
        return string.Join(",", (orders ?? []).Select(o => o.Id));
    }

    private sealed record OrderDto(int Id, string? Customer, string? Status, int TotalCents);

    private sealed record ProductDto(string? Sku, string? Name, int PriceCents);
}
```

In plain English: ex1 checks two different ids so a hard-coded order cannot
pass, then checks that a non-numeric id 404s from routing. ex2 checks both
group routes and the "unknown customer is 404" decision. ex3 checks the status
code, the `Location` header and every field of the created body, then the two
rejection paths. ex4 walks the filter/sort matrix and insists the 400 says what
was wrong. The challenge walks all four codes plus the route constraint.

## The teaching point

Everything in this lesson was really one question asked six ways: **what does
this response mean to the client?** 404 means stop looking. 400 means fix your
request and try again. 409 means your request was fine but the world was not.
201 with a `Location` means "here is where it lives now, go and get it". A
client — or a retry policy, or a circuit breaker, or a monitoring dashboard —
reads those codes and acts. An API that returns 200 with `null` inside makes
every one of those decisions impossible, and pushes the work onto every caller
forever.

The other habit worth taking away is putting the constraint in the route
template rather than an `if` at the top of the handler. Routing is a matching
engine; the more you tell it, the less validation code you write, and the
earlier a wrong request stops.

Next: **02_dependency_injection**, where your handlers stop being static
functions over static data and start asking the container for things — and
where getting a lifetime wrong produces a bug that only shows up on the second
request.
