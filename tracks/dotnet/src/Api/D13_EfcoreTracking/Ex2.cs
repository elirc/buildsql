// d13_efcore_tracking / ex2 - load, assign, save.
// See lessons/d13_efcore_tracking/README.md, "Exercise 2".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d13/vans/{id:int}/mileage", Update);
    }

    // 404 when there is no such van. 400 when the new reading is lower than
    // the current one (odometers do not run backwards). Otherwise 204, having
    // changed the mileage AND NOTHING ELSE, in exactly two round trips: one
    // SELECT, one UPDATE.
    private static async Task<IResult> Update(int id, MileageChange request, D13Db db)
    {
        // TODO ex2: this version never reads the van at all. It cannot answer
        // 404, it cannot compare against the current reading, and the entity
        // it fabricates here has "" for every column it did not mention -
        // which Update() happily writes over the real row.
        db.Vans.Update(new Van { Id = id, Mileage = request.Mileage });
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
