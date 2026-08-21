// 06_efcore_relationships / challenge - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/customers/top", TopCustomers);
    }

    private static async Task<IResult> TopCustomers(int? limit, OrdersDb db)
    {
        int take = limit ?? 3;
        if (take < 1)
        {
            return TypedResults.BadRequest();
        }

        var rows = await db.Customers
            .Select(c => new
            {
                c.Id,
                c.Name,
                Total = c.Orders.Sum(o => o.Lines.Sum(l => l.Quantity * l.UnitPriceCents)),
            })
            .OrderByDescending(row => row.Total)
            .ThenBy(row => row.Name)
            .Take(take)
            .ToListAsync();

        var top = rows.Select(row => new CustomerSpend(row.Id, row.Name, row.Total)).ToList();
        return TypedResults.Ok(top);
    }
}
