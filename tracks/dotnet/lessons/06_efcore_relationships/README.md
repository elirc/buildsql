# 06 — Relationships, Include and the N+1

One table was never the interesting case. Real data is a graph: a customer has
orders, an order has lines, a line points at a product, a product carries tags.
The moment a second table appears, so do the two questions that dominate every
performance conversation about an ORM — *what did you load*, and *how many times
did you ask*.

This lesson has five entities and every relationship shape you will meet:

```
Customer  1 ──── *  Order  1 ──── *  OrderLine  * ──── 1  Product  * ──── *  Tag
```

Read `src/Api/L06_EfcoreRelationships/Model.cs` before you start; it is given
code and every expected value below comes from the seed data in the gate.

## Concept — navigations, and the four ways to fill them

A **navigation property** is a property whose type is another entity, or a
collection of them. `Order.Customer` is a reference navigation; `Customer.Orders`
and `Order.Lines` are collection navigations. `Order.CustomerId` is the
**foreign key**, and naming it `<Navigation>Id` is the entire reason EF knows how
these two are related — no attributes, no configuration.

`Product.Tags` and `Tag.Products` are a **many-to-many**. EF creates and manages
the join table by itself; there is no `ProductTag` class in the model, and the
navigations that skip over it are called *skip navigations*.

Now, the important part. **EF never loads a navigation unless you ask.** Load an
order and `order.Lines` is an empty list — not null, not lazy, just empty. That
is a deliberate design choice, and it means "how do I fill this in" is a
question you answer explicitly, four ways:

```csharp
// 1. Eager loading - one query with a JOIN
var customer = await db.Customers
    .Include(c => c.Orders)
        .ThenInclude(o => o.Lines)
    .FirstOrDefaultAsync(c => c.Id == id);

// 2. Projection - one query, and only the columns you named
var summary = await db.Orders
    .Select(o => new { o.Id, Customer = o.Customer!.Name, Lines = o.Lines.Count })
    .ToListAsync();

// 3. Explicit loading - a second query, on demand
await db.Entry(order).Collection(o => o.Lines).LoadAsync();

// 4. Lazy loading - a query per navigation, automatically, behind your back
```

Lazy loading is off by default and this course leaves it off. It is the feature
that turns a loop over a hundred orders into a hundred and one queries without a
single line of code saying so, which is why most teams that turn it on turn it
off again.

### The N+1 problem

This is the one to be able to explain in an interview, so here it is precisely.
You need a list of orders with their customer's name. You write:

```csharp
var orders = await db.Orders.ToListAsync();                       // 1 query
foreach (var order in orders)
{
    var customer = await db.Customers.FindAsync(order.CustomerId); // N queries
}
```

One query for the list, plus one per row: **N+1**. Every answer is correct.
Every test on the response body passes. And each of those N queries is a network
round trip, so at four orders it is invisible and at four thousand it is a
ten-second endpoint. Nothing in the code says "slow"; the cost is in the count.

The fix is always the same shape: **ask the database once, for exactly the shape
you want.** Either `Include` (bring the related entities back with the parents)
or a projection (let SQL compute the answer and return three columns). Projection
is usually better, because `Include` on several collections multiplies rows —
the cartesian explosion — while a projection with aggregates returns one row per
result.

`Ex3.cs` ships with a working N+1 implementation, on purpose. Your job is to
make the same numbers come out of one query.

## Exercise 1 — load the "many" side

Edit `src/Api/L06_EfcoreRelationships/Ex1.cs`. Implement
`GET /l06/customers/{id}` to answer **200** with a `CustomerDetail` — the
customer's id and name, plus their orders (id and reference), id ascending:

```json
{"id":1,"name":"Ada","orders":[{"id":1,"reference":"A-1001"},{"id":3,"reference":"A-1003"}]}
```

**404** when the customer does not exist. A customer who exists and has never
ordered is a **200 with an empty list** — the customer is there, the collection
is empty, and those are different facts.

Write it once without `Include` and look at what comes back. An empty `orders`
array, no exception, no warning. That silence is the thing to remember.

```
uv run dojo test dotnet 06_efcore_relationships ex1
```

## Exercise 2 — many-to-many, from both ends

Edit `src/Api/L06_EfcoreRelationships/Ex2.cs`. Two endpoints, both answering
**200** with a plain array of strings sorted A–Z, and **404** when the thing in
the route does not exist:

- `GET /l06/products/{id}/tags` — that product's tag names
- `GET /l06/tags/{name}/products` — the names of products carrying that tag

The join table never appears in your code. `SelectMany` is the operator that
walks a collection navigation and flattens it, and it works identically in both
directions — which is the point of the exercise.

Note that "does not exist" needs its own check: a product with no tags and a
product that is not there both produce an empty list, so you have to ask
separately.

```
uv run dojo test dotnet 06_efcore_relationships ex2
```

## Exercise 3 — kill the N+1

Edit `src/Api/L06_EfcoreRelationships/Ex3.cs`. The handler already works and
already returns the right numbers: one `OrderTotals` per order, id ascending,
carrying the order id, the customer's name, the number of lines, and
quantity × unit price summed over those lines.

Run the gate first and read the failure. The values are all correct; the gate
fails because it counted the SQL commands, and there were nine.

Rewrite it as a single query. Everything you need is expressible in one
`Select`: `o.Customer!.Name` becomes a join, `o.Lines.Count` becomes a
correlated subquery, and `o.Lines.Sum(l => l.Quantity * l.UnitPriceCents)`
becomes another. All of it is computed by the database, and what comes back over
the wire is four rows of four columns.

```
uv run dojo test dotnet 06_efcore_relationships ex3
```

## Exercise 4 — the identity map, made visible

Edit `src/Api/L06_EfcoreRelationships/Ex4.cs`. Implement
`GET /l06/identity?tracked=true|false` so that it loads orders 1 and 3 — both
Ada's — with their `Customer` navigation filled in, tracked or not according to
the flag, and answers **200** with:

```json
{"sameInstance": <ReferenceEquals of the two Customer objects>, "customerName":"Ada"}
```

Run it both ways. Tracked gives you `true`; `AsNoTracking` gives you `false`.
Same rows, same data, and two objects instead of one — because tracking
maintains an **identity map** keyed on the primary key, and no-tracking does not.

This matters in practice more than it sounds. Mutate `order1.Customer!.Name` in
a tracked graph and `order3.Customer!.Name` changes too, because it is the same
object; do it in an untracked graph and the second one does not. Memory is the
other half: an untracked query over ten thousand order lines can materialise ten
thousand copies of the same handful of products.

```
uv run dojo test dotnet 06_efcore_relationships ex4
```

## Challenge — an aggregate across three tables, in one query

Honest difficulty note: the LINQ is six lines. Getting it to translate is the
work, and the trick you need is in the hints.

Edit `src/Api/L06_EfcoreRelationships/Challenge.cs`. Implement
`GET /l06/customers/top?limit=` returning the top `limit` customers by total
spend — quantity × unit price, over every line of every order they placed —
highest first, name ascending to break ties:

```json
[{"customerId":1,"name":"Ada","totalCents":30500}, … ]
```

`limit` defaults to 3, and `limit < 1` is **400**. A customer who has never
ordered still appears, with a total of **0** — that is the difference between a
left join and an inner one, and dropping people who have not bought anything is
a classic reporting bug.

And it has to be **one** SQL command. The gate counts.

```
uv run dojo test dotnet 06_efcore_relationships challenge
```

## Review

`review1` is not part of finishing this lesson; the scheduler brings it back
later. Edit `src/Api/L06_EfcoreRelationships/Review1.cs`: implement
`GET /l06/review/orders/{id}/lines` returning one `LineDetail` per line — the
product's name, the quantity, and quantity × unit price — product name
ascending, with **404** for an order that does not exist.

## The gate

This is the entire gate class, `tests/Gates/L06_EfcoreRelationshipsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.L06_EfcoreRelationships;

namespace DotnetDojo.Gates;

public class L06_EfcoreRelationshipsTests
{
    [Fact]
    public async Task Ex1_ACustomerComesBackWithTheirOrders()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/l06/customers/1");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l06/customers/1 must answer 200 - reread README ex1.");

        var ada = await response.Content.ReadFromJsonAsync<CustomerDto>();
        Teach.Equal("Ada", ada?.Name, "Customer 1 is Ada.");
        Teach.Equal("1,3", string.Join(",", (ada?.Orders ?? []).Select(o => o.Id)),
            "Ada placed orders 1 and 3, id ascending. An empty list means the Orders "
                + "navigation was never populated: EF does not load related data unless you "
                + "ask, so a plain FirstOrDefaultAsync leaves it empty rather than throwing.");
        Teach.Equal("A-1001", (ada?.Orders ?? []).FirstOrDefault()?.Reference,
            "Each order carries its reference too.");

        var linus = await client.GetFromJsonAsync<CustomerDto>("/l06/customers/3");
        Teach.Equal("", string.Join(",", (linus?.Orders ?? []).Select(o => o.Id)),
            "Linus exists and has ordered nothing. That is a 200 with an empty list, not a "
                + "404 - the customer is there, the collection is empty.");

        var missing = await client.GetAsync("/l06/customers/99");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "There is no customer 99: 404.");
    }

    [Fact]
    public async Task Ex2_ManyToManyWorksFromBothEnds()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var tags = await client.GetAsync("/l06/products/2/tags");
        await Teach.Status(HttpStatusCode.OK, tags,
            "GET /l06/products/2/tags must answer 200 - reread README ex2.");
        Teach.Equal("clothing,training", await Names(tags),
            "Product 2 is the Gi, which is tagged clothing and training. One product, two "
                + "tags - that is the \"many\" on this side.");

        var single = await client.GetAsync("/l06/products/4/tags");
        Teach.Equal("comfort", await Names(single),
            "The Zabuton has exactly one tag.");

        var products = await client.GetAsync("/l06/tags/training/products");
        await Teach.Status(HttpStatusCode.OK, products,
            "GET /l06/tags/training/products must answer 200.");
        Teach.Equal("Bokken,Gi", await Names(products),
            "Two products carry the training tag. The same join table, walked the other way - "
                + "and you never had to name it.");

        var noProduct = await client.GetAsync("/l06/products/99/tags");
        await Teach.Status(HttpStatusCode.NotFound, noProduct,
            "Product 99 does not exist, so this is a 404 rather than an empty list.");

        var noTag = await client.GetAsync("/l06/tags/nope/products");
        await Teach.Status(HttpStatusCode.NotFound, noTag,
            "No tag is called \"nope\": 404.");
    }

    [Fact]
    public async Task Ex3_TheSummaryIsCorrectAndCostsOneQuery()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/l06/orders/summary");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l06/orders/summary must answer 200 - reread README ex3.");

        var summary = await response.Content.ReadFromJsonAsync<List<TotalsDto>>() ?? [];
        Teach.Equal("1,2,3,4", string.Join(",", summary.Select(s => s.OrderId)),
            "One row per order, id ascending.");
        Teach.Equal("Ada,Grace,Ada,Grace", string.Join(",", summary.Select(s => s.Customer)),
            "Orders 1 and 3 are Ada's, 2 and 4 are Grace's.");
        Teach.Equal("2,1,1,2", string.Join(",", summary.Select(s => s.LineCount)),
            "Line counts per order: 2, 1, 1, 2.");
        Teach.Equal("23700,7200,6800,8300", string.Join(",", summary.Select(s => s.TotalCents)),
            "Totals are quantity * unit price summed over each order's lines.");

        Teach.True(commands == 1,
            $"The numbers are right and it took {commands} SQL commands to get them. That is "
                + "the N+1 problem: one query for the orders, then two more per order. Ask "
                + "the database for the shape you want - a Select that projects the "
                + "customer's name and aggregates over o.Lines - and it is one query, "
                + "whatever the number of orders.");
    }

    [Fact]
    public async Task Ex4_TrackingGivesYouOneCustomerObjectAndNoTrackingGivesYouTwo()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var tracked = await client.GetAsync("/l06/identity?tracked=true");
        await Teach.Status(HttpStatusCode.OK, tracked,
            "GET /l06/identity?tracked=true must answer 200 - reread README ex4.");

        var trackedBody = await tracked.Content.ReadFromJsonAsync<IdentityDto>();
        Teach.Equal("Ada", trackedBody?.CustomerName,
            "Orders 1 and 3 both belong to Ada.");
        Teach.Equal(true, trackedBody?.SameInstance,
            "A tracked query keeps an identity map keyed on the primary key, so the same "
                + "customer row becomes the same object no matter how many times it appears "
                + "in the results. Getting false here means the query was not tracked.");

        var untracked = await client.GetFromJsonAsync<IdentityDto>("/l06/identity?tracked=false");
        Teach.Equal("Ada", untracked?.CustomerName,
            "The data is the same either way.");
        Teach.Equal(false, untracked?.SameInstance,
            "AsNoTracking has no identity map, so each row materialises its own Customer "
                + "object - two objects with equal contents and different identities. That is "
                + "the trade: less bookkeeping, more duplicates.");
    }

    [Fact]
    public async Task Challenge_TopSpendersInOneQuery()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/l06/customers/top?limit=2");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l06/customers/top?limit=2 must answer 200 - reread README challenge.");

        var top = await response.Content.ReadFromJsonAsync<List<SpendDto>>() ?? [];
        Teach.Equal("Ada,Grace", string.Join(",", top.Select(t => t.Name)),
            "Ada spent 30500, Grace 15500, so those are the top two in that order.");
        Teach.Equal("30500,15500", string.Join(",", top.Select(t => t.TotalCents)),
            "Sum quantity * unit price over every line of every order the customer placed.");
        Teach.True(commands == 1,
            $"It took {commands} SQL commands. An aggregate over three tables is one GROUP BY "
                + "away from being a single query - let the database do the arithmetic.");

        var all = await client.GetFromJsonAsync<List<SpendDto>>("/l06/customers/top");
        Teach.Equal("Ada,Grace,Linus", string.Join(",", (all ?? []).Select(t => t.Name)),
            "The default limit is 3, and Linus has to appear with a total of 0 - a customer "
                + "who has never ordered still exists. An inner join would drop him.");
        Teach.Equal(0, (all ?? []).Last().TotalCents,
            "Linus's total is 0, not null and not missing.");

        var zero = await client.GetAsync("/l06/customers/top?limit=0");
        await Teach.Status(HttpStatusCode.BadRequest, zero, "limit=0 is a 400.");
    }

    [Fact]
    public async Task Review1_OrderLinesWithTheirProductNames()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/l06/review/orders/1/lines");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l06/review/orders/1/lines must answer 200 - reread README review.");

        var lines = await response.Content.ReadFromJsonAsync<List<LineDto>>() ?? [];
        Teach.Equal("Bokken,Gi", string.Join(",", lines.Select(l => l.ProductName)),
            "Order 1 has two lines, and the product name is one hop away from the line - "
                + "product name ascending.");
        Teach.Equal("1,2", string.Join(",", lines.Select(l => l.Quantity)),
            "One Bokken and two Gi.");
        Teach.Equal("5900,17800", string.Join(",", lines.Select(l => l.LineTotalCents)),
            "Line total is quantity * unit price: 1 * 5900 and 2 * 8900.");

        var missing = await client.GetAsync("/l06/review/orders/99/lines");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "Order 99 does not exist. An empty list would say the order is there and has no "
                + "lines, which is a different claim.");
    }

    private static SqliteHost<OrdersDb> NewHost() =>
        new SqliteHost<OrdersDb>().Seed(db =>
        {
            var training = new Tag { Id = 1, Name = "training" };
            var clothing = new Tag { Id = 2, Name = "clothing" };
            var comfort = new Tag { Id = 3, Name = "comfort" };
            db.Tags.AddRange(training, clothing, comfort);

            var bokken = new Product { Id = 1, Name = "Bokken", Tags = [training] };
            var gi = new Product { Id = 2, Name = "Gi", Tags = [clothing, training] };
            var obi = new Product { Id = 3, Name = "Obi", Tags = [clothing] };
            var zabuton = new Product { Id = 4, Name = "Zabuton", Tags = [comfort] };
            db.Products.AddRange(bokken, gi, obi, zabuton);

            db.Customers.AddRange(
                new Customer { Id = 1, Name = "Ada" },
                new Customer { Id = 2, Name = "Grace" },
                new Customer { Id = 3, Name = "Linus" });

            db.Orders.AddRange(
                new Order { Id = 1, Reference = "A-1001", CustomerId = 1 },
                new Order { Id = 2, Reference = "A-1002", CustomerId = 2 },
                new Order { Id = 3, Reference = "A-1003", CustomerId = 1 },
                new Order { Id = 4, Reference = "A-1004", CustomerId = 2 });

            db.OrderLines.AddRange(
                new OrderLine { Id = 1, OrderId = 1, ProductId = 1, Quantity = 1, UnitPriceCents = 5900 },
                new OrderLine { Id = 2, OrderId = 1, ProductId = 2, Quantity = 2, UnitPriceCents = 8900 },
                new OrderLine { Id = 3, OrderId = 2, ProductId = 3, Quantity = 3, UnitPriceCents = 2400 },
                new OrderLine { Id = 4, OrderId = 3, ProductId = 4, Quantity = 2, UnitPriceCents = 3400 },
                new OrderLine { Id = 5, OrderId = 4, ProductId = 1, Quantity = 1, UnitPriceCents = 5900 },
                new OrderLine { Id = 6, OrderId = 4, ProductId = 3, Quantity = 1, UnitPriceCents = 2400 });
        });

    private static async Task<string> Names(HttpResponseMessage response)
    {
        var names = await response.Content.ReadFromJsonAsync<List<string>>();
        return string.Join(",", names ?? []);
    }

    private sealed record OrderDto(int Id, string? Reference);

    private sealed record CustomerDto(int Id, string? Name, List<OrderDto>? Orders);

    private sealed record TotalsDto(int OrderId, string? Customer, int LineCount, int TotalCents);

    private sealed record IdentityDto(bool SameInstance, string? CustomerName);

    private sealed record SpendDto(int CustomerId, string? Name, int TotalCents);

    private sealed record LineDto(string? ProductName, int Quantity, int LineTotalCents);
}
```

In plain English: `host.Commands` is an `ILoggerProvider` plugged into the test
host that counts EF Core's "command executed" log events — one per round trip to
the database. That is how ex3 and the challenge can fail an implementation whose
*output* is perfect. It is also exactly what you would do in a real project to
put a regression test around a query you have just optimised.

## The teaching point

There are two separate skills here and it is worth keeping them apart.

The first is **loading what you need**: navigations are empty until you say
otherwise, `Include` brings entities, projection brings columns, and projection
is the default answer for anything you are about to serialise. If a response DTO
has four fields, there is no reason for the query to have loaded forty columns
and a tracked entity graph.

The second is **counting round trips**. It is the only performance metric that
matters at this layer, it is invisible in the response, and it is measurable in
one line. Any time you find yourself writing `foreach` around an `await` on a
`DbContext`, stop: that loop is an N+1 and the database can almost certainly
answer the whole question at once.

Next: **07_rest_crud**, where a resource gets a full lifecycle — DTOs in,
entities hidden, validation, and every status code doing an honest job.
