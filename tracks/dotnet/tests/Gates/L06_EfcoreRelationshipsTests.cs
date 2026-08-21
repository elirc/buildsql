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
