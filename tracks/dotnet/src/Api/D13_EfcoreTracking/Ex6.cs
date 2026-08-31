// d13_efcore_tracking / ex6 - bulk update blindsides the tracker.
// See lessons/d13_efcore_tracking/README.md, "Exercise 6".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d13/depots/{depot}/service-bump", Bump);
    }

    // Every van in the depot gets Amount added to its mileage, in one
    // ExecuteUpdate - no van is loaded to do it. 400 when Amount is not
    // positive; 404 when the depot has no vans at all. Answer 200 with each
    // van as a DepotVan (id ascending) showing the mileage AS IT IS NOW, in
    // at most three round trips.
    private static async Task<IResult> Bump(string depot, BumpRequest request, D13Db db)
    {
        if (request.Amount <= 0)
        {
            return TypedResults.BadRequest("amount must be positive.");
        }

        // TODO ex6: this reads the vans BEFORE the bulk update and then
        // reports the list it is still holding. ExecuteUpdate goes straight
        // to the database; nothing it changes ever reaches objects that were
        // already materialised.
        var vans = await db.Vans.Where(v => v.Depot == depot).OrderBy(v => v.Id).ToListAsync();
        if (vans.Count == 0)
        {
            return TypedResults.NotFound();
        }

        await db.Vans
            .Where(v => v.Depot == depot)
            .ExecuteUpdateAsync(s => s.SetProperty(v => v.Mileage, v => v.Mileage + request.Amount));

        return TypedResults.Ok(vans.Select(v => new DepotVan(v.Id, v.Mileage)).ToList());
    }
}
