// d13_efcore_tracking / ex4 - the identity map.
// See lessons/d13_efcore_tracking/README.md, "Exercise 4".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d13/vans/{id:int}/recheck", Recheck);
    }

    // The dispatcher double-checks a van before assigning it: fetch it, then
    // fetch it again. 404 when it does not exist. Otherwise 200 with a
    // RecheckReport where SameInstance is true and the WHOLE request cost
    // exactly ONE database query - the second fetch must be answered by the
    // context, not by SQLite.
    private static async Task<IResult> Recheck(int id, D13Db db)
    {
        // TODO ex4: two untracked queries means two round trips and two
        // different objects. One of these fetches should never reach the
        // database.
        var first = await db.Vans.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id);
        if (first is null)
        {
            return TypedResults.NotFound();
        }

        var again = await db.Vans.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id);

        return TypedResults.Ok(new RecheckReport(first.Plate, ReferenceEquals(first, again)));
    }
}
