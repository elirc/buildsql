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
