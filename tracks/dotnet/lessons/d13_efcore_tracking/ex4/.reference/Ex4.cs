// d13_efcore_tracking / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d13/vans/{id:int}/recheck", Recheck);
    }

    private static async Task<IResult> Recheck(int id, D13Db db)
    {
        // Tracked, so the context remembers it under its key...
        var first = await db.Vans.FirstOrDefaultAsync(v => v.Id == id);
        if (first is null)
        {
            return TypedResults.NotFound();
        }

        // ...and Find asks the identity map before it builds any SQL.
        var again = await db.Vans.FindAsync(id);

        return TypedResults.Ok(new RecheckReport(first.Plate, ReferenceEquals(first, again)));
    }
}
