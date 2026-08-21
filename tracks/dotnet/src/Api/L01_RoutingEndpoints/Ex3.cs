// 01_routing_endpoints / ex3 - 201 Created, and the Location header.
// See lessons/01_routing_endpoints/README.md, "Exercise 3".

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l01/orders", CreateOrder);
    }

    // 201 with a Location header of /l01/orders/{new id} and the new order as
    // the body; 400 when the customer is blank or totalCents is not positive.
    private static IResult CreateOrder(NewOrder request) =>
        throw new NotImplementedException("ex3: POST /l01/orders is not implemented yet - edit src/Api/L01_RoutingEndpoints/Ex3.cs");
}
