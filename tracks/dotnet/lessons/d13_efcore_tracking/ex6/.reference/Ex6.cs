// d13_efcore_tracking / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d13/depots/{depot}/service-bump", Bump);
    }

    private static async Task<IResult> Bump(string depot, BumpRequest request, D13Db db)
    {
        if (request.Amount <= 0)
        {
            return TypedResults.BadRequest("amount must be positive.");
        }

        // Update first. The row count doubles as the existence check.
        int hit = await db.Vans
            .Where(v => v.Depot == depot)
            .ExecuteUpdateAsync(s => s.SetProperty(v => v.Mileage, v => v.Mileage + request.Amount));
        if (hit == 0)
        {
            return TypedResults.NotFound();
        }

        // Then read fresh: a projection is never tracked, so these values
        // come from the database, not from anything the context remembers.
        var rows = await db.Vans
            .Where(v => v.Depot == depot)
            .OrderBy(v => v.Id)
            .Select(v => new DepotVan(v.Id, v.Mileage))
            .ToListAsync();

        return TypedResults.Ok(rows);
    }
}
