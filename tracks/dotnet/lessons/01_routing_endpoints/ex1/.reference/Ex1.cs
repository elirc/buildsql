// 01_routing_endpoints / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l01/orders/{id:int}", GetOrder);
    }

    private static IResult GetOrder(int id)
    {
        var order = Catalog.Orders.FirstOrDefault(o => o.Id == id);
        return order is null ? TypedResults.NotFound() : TypedResults.Ok(order);
    }
}
