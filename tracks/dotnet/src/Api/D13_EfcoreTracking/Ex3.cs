// d13_efcore_tracking / ex3 - nothing changed, nothing written.
// See lessons/d13_efcore_tracking/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d13/vans/{id:int}/depot", Move);
    }

    // 404 when there is no such van, 400 when the depot is blank. Otherwise
    // 200 with a ChangeReport saying whether anything was actually written:
    // assigning the depot the van already has must issue NO update at all -
    // one round trip, Changed = false. A real move is two round trips and
    // Changed = true.
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

        // TODO ex3: Update() stamps EVERY property as modified, so even a
        // "move" to the depot the van is already in becomes a full UPDATE.
        // Let change detection decide instead, and report what SaveChanges
        // actually did.
        van.Depot = request.Depot;
        db.Vans.Update(van);
        await db.SaveChangesAsync();

        return TypedResults.Ok(new ChangeReport(true));
    }
}
