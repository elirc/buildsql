// 06_efcore_relationships / review1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/review/orders/{id:int}/lines", Lines);
    }

    private static async Task<IResult> Lines(int id, OrdersDb db)
    {
        if (!await db.Orders.AnyAsync(o => o.Id == id))
        {
            return TypedResults.NotFound();
        }

        var lines = await db.OrderLines
            .Where(l => l.OrderId == id)
            .OrderBy(l => l.Product!.Name)
            .Select(l => new LineDetail(
                l.Product!.Name,
                l.Quantity,
                l.Quantity * l.UnitPriceCents))
            .ToListAsync();

        return TypedResults.Ok(lines);
    }
}
