// d13_efcore_tracking / ex5 - update without loading.
// See lessons/d13_efcore_tracking/README.md, "Exercise 5".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d13/vans/{id:int}", Replace);
    }

    // A full replacement: the payload carries every client-visible column.
    // 400 when plate, depot or status is blank, or mileage is negative.
    // 204 on success - in exactly ONE round trip. The depot office syncs
    // thousands of vans a night; a SELECT before every UPDATE is a budget
    // this endpoint does not have. 404 when the row turns out not to exist -
    // which you only learn when the UPDATE touches nothing.
    private static async Task<IResult> Replace(int id, VanReplacement request, D13Db db)
    {
        if (string.IsNullOrWhiteSpace(request.Plate)
            || string.IsNullOrWhiteSpace(request.Depot)
            || string.IsNullOrWhiteSpace(request.Status)
            || request.Mileage < 0)
        {
            return TypedResults.BadRequest("plate, depot and status are required; mileage must not be negative.");
        }

        // TODO ex5: this is the comfortable two-trip version - load, assign,
        // save. Rewrite it to send the UPDATE without the SELECT: build the
        // entity from the payload, attach it as modified, and treat "zero
        // rows affected" as the 404.
        var van = await db.Vans.FirstOrDefaultAsync(v => v.Id == id);
        if (van is null)
        {
            return TypedResults.NotFound();
        }

        van.Plate = request.Plate;
        van.Depot = request.Depot;
        van.Mileage = request.Mileage;
        van.Status = request.Status;
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
