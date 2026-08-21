// 01_routing_endpoints / ex2 - route groups.
// See lessons/01_routing_endpoints/README.md, "Exercise 2".

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex2: nothing is mapped yet, so both routes answer 404.
        // Create a route group for "/l01/customers" and map ListCustomers on
        // the group's own root and OrdersFor on "/{name}/orders".
    }

    // 200 with every distinct customer name in Catalog.Orders, sorted A-Z.
    private static IResult ListCustomers() =>
        throw new NotImplementedException("ex2: ListCustomers is not implemented yet - edit src/Api/L01_RoutingEndpoints/Ex2.cs");

    // 200 with that customer's orders (id ascending), or 404 if nobody has that name.
    private static IResult OrdersFor(string name) =>
        throw new NotImplementedException("ex2: OrdersFor is not implemented yet - edit src/Api/L01_RoutingEndpoints/Ex2.cs");
}
