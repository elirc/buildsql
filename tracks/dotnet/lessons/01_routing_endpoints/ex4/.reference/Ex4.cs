// 01_routing_endpoints / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.AspNetCore.Http.HttpResults;

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l01/orders", SearchOrders);
    }

    private static Results<Ok<List<Order>>, BadRequest<string>> SearchOrders(
        string? status, string? sort)
    {
        if (status is not null && !Catalog.Statuses.Contains(status))
        {
            return TypedResults.BadRequest($"unknown status '{status}'");
        }

        if (sort is not null && sort != "id" && sort != "total")
        {
            return TypedResults.BadRequest($"unknown sort '{sort}'");
        }

        var query = Catalog.Orders.AsEnumerable();
        if (status is not null)
        {
            query = query.Where(o => o.Status == status);
        }

        query = sort == "total" ? query.OrderBy(o => o.TotalCents) : query.OrderBy(o => o.Id);
        return TypedResults.Ok(query.ToList());
    }
}
