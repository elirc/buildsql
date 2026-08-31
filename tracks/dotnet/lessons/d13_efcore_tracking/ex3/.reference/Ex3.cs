// d13_efcore_tracking / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d13/vans/{id:int}/depot", Move);
    }

    private static async Task<IResult> Move(int id, DepotChange request, D13Db db)
    {
        var van = await db.Vans.FirstOrDefaultAsync(v => v.Id == id);
        if (van is null)
        {
            return TypedResults.NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Depot))
        {
            return TypedResults.BadRequest("depot is required.");
        }

        // Assign unconditionally and let change detection decide. SaveChanges
        // returns the number of rows it wrote: 0 for a no-op move, 1 for a
        // real one - which is exactly the report.
        van.Depot = request.Depot;
        int written = await db.SaveChangesAsync();

        return TypedResults.Ok(new ChangeReport(written > 0));
    }
}
