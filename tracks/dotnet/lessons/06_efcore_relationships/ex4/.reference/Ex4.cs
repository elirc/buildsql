// 06_efcore_relationships / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/identity", Identity);
    }

    private static async Task<IResult> Identity(bool tracked, OrdersDb db)
    {
        IQueryable<Order> query = tracked ? db.Orders.AsQueryable() : db.Orders.AsNoTracking();

        var orders = await query
            .Include(o => o.Customer)
            .Where(o => o.Id == 1 || o.Id == 3)
            .OrderBy(o => o.Id)
            .ToListAsync();

        var first = orders[0].Customer!;
        var second = orders[1].Customer!;

        return TypedResults.Ok(new IdentityResult(ReferenceEquals(first, second), first.Name));
    }
}
