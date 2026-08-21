// 06_efcore_relationships / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/orders/summary", Summary);
    }

    private static async Task<IResult> Summary(OrdersDb db)
    {
        var summaries = await db.Orders
            .OrderBy(o => o.Id)
            .Select(o => new OrderTotals(
                o.Id,
                o.Customer!.Name,
                o.Lines.Count,
                o.Lines.Sum(l => l.Quantity * l.UnitPriceCents)))
            .ToListAsync();

        return TypedResults.Ok(summaries);
    }
}
