// 01_routing_endpoints / challenge - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/l01/orders/{id:int:min(1)}/status", ChangeStatus);
    }

    private static IResult ChangeStatus(int id, StatusChange request)
    {
        var order = Catalog.Orders.FirstOrDefault(o => o.Id == id);
        if (order is null)
        {
            return TypedResults.NotFound();
        }

        if (request.Status is null || !Catalog.Statuses.Contains(request.Status))
        {
            return TypedResults.BadRequest();
        }

        if (order.Status == "cancelled")
        {
            return TypedResults.Conflict();
        }

        return TypedResults.NoContent();
    }
}
