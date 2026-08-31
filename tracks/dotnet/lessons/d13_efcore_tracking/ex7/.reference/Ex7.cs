// d13_efcore_tracking / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d13/vans/{id:int}/tuneup", Tuneup);
    }

    private static async Task<IResult> Tuneup(int id, D13Db db)
    {
        // Check existence without tracking anything - the identity map never
        // learns about this row, so nothing can go stale.
        bool exists = await db.Vans.AsNoTracking().AnyAsync(v => v.Id == id);
        if (!exists)
        {
            return TypedResults.NotFound();
        }

        await D13Calibration.Apply(db, id);

        // A projection bypasses the identity map: these are the columns as
        // the database holds them right now.
        var report = await db.Vans
            .Where(v => v.Id == id)
            .Select(v => new TuneupReport(v.Id, v.Mileage))
            .SingleAsync();

        return TypedResults.Ok(report);
    }
}
