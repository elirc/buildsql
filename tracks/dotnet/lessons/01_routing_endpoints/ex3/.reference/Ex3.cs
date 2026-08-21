// 01_routing_endpoints / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l01/orders", CreateOrder);
    }

    private static IResult CreateOrder(NewOrder request)
    {
        if (string.IsNullOrWhiteSpace(request.Customer) || request.TotalCents <= 0)
        {
            return TypedResults.BadRequest();
        }

        var order = new Order(Catalog.NextOrderId, request.Customer, "pending", request.TotalCents);
        return TypedResults.Created($"/l01/orders/{order.Id}", order);
    }
}
