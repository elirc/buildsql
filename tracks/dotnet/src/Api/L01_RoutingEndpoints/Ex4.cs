// 01_routing_endpoints / ex4 - optional query parameters and a typed result union.
// See lessons/01_routing_endpoints/README.md, "Exercise 4".

using Microsoft.AspNetCore.Http.HttpResults;

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l01/orders", SearchOrders);
    }

    // ?status=shipped filters; ?sort=total orders by totalCents ascending;
    // both are optional and default to "everything, id ascending".
    // An unknown status or sort value is a 400 with the offending value.
    private static Results<Ok<List<Order>>, BadRequest<string>> SearchOrders(
        string? status, string? sort) =>
        throw new NotImplementedException("ex4: GET /l01/orders is not implemented yet - edit src/Api/L01_RoutingEndpoints/Ex4.cs");
}
