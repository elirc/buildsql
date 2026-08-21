// 01_routing_endpoints / ex1 - route parameters, and the 404 that means "no such thing".
// See lessons/01_routing_endpoints/README.md, "Exercise 1".

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l01/orders/{id:int}", GetOrder);
    }

    // 200 with the matching order from Catalog.Orders, or 404 if there is none.
    private static IResult GetOrder(int id) =>
        throw new NotImplementedException("ex1: GET /l01/orders/{id} is not implemented yet - edit src/Api/L01_RoutingEndpoints/Ex1.cs");
}
