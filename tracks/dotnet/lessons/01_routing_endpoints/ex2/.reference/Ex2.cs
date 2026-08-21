// 01_routing_endpoints / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var customers = app.MapGroup("/l01/customers");
        customers.MapGet("", ListCustomers);
        customers.MapGet("/{name}/orders", OrdersFor);
    }

    private static IResult ListCustomers() =>
        TypedResults.Ok(Catalog.Orders
            .Select(o => o.Customer)
            .Distinct()
            .OrderBy(n => n, StringComparer.Ordinal)
            .ToList());

    private static IResult OrdersFor(string name)
    {
        var orders = Catalog.Orders
            .Where(o => o.Customer == name)
            .OrderBy(o => o.Id)
            .ToList();

        return orders.Count == 0 ? TypedResults.NotFound() : TypedResults.Ok(orders);
    }
}
