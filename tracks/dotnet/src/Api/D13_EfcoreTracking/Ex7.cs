// d13_efcore_tracking / ex7 - the cache that lied.
// See lessons/d13_efcore_tracking/README.md, "Exercise 7".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d13/vans/{id:int}/tuneup", Tuneup);
    }

    // A tuneup report: 404 when the van does not exist; otherwise apply the
    // calibration correction (D13Calibration.Apply - given code, call it
    // exactly once) and answer 200 with a TuneupReport carrying the mileage
    // AFTER the correction.
    private static async Task<IResult> Tuneup(int id, D13Db db)
    {
        // TODO ex7: the first fetch tracks the van. After the calibration
        // writes past the tracker, the re-query below really does hit the
        // database - and then hands back the SAME stale instance, because for
        // a tracked entity the identity map wins over fresh column values.
        var van = await db.Vans.FirstOrDefaultAsync(v => v.Id == id);
        if (van is null)
        {
            return TypedResults.NotFound();
        }

        await D13Calibration.Apply(db, id);

        var refreshed = await db.Vans.FirstAsync(v => v.Id == id);

        return TypedResults.Ok(new TuneupReport(refreshed.Id, refreshed.Mileage));
    }
}
