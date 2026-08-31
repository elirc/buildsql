// d13_efcore_tracking / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d13/vans/{id:int}", Replace);
    }

    private static async Task<IResult> Replace(int id, VanReplacement request, D13Db db)
    {
        if (string.IsNullOrWhiteSpace(request.Plate)
            || string.IsNullOrWhiteSpace(request.Depot)
            || string.IsNullOrWhiteSpace(request.Status)
            || request.Mileage < 0)
        {
            return TypedResults.BadRequest("plate, depot and status are required; mileage must not be negative.");
        }

        // Build the entity from the payload and attach it as modified: one
        // UPDATE, no SELECT. Every column is in the payload, so overwriting
        // all of them is exactly what a full replacement means.
        var van = new Van
        {
            Id = id,
            Plate = request.Plate,
            Depot = request.Depot,
            Mileage = request.Mileage,
            Status = request.Status,
        };
        db.Vans.Update(van);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Zero rows affected: the van was never there.
            return TypedResults.NotFound();
        }

        return TypedResults.NoContent();
    }
}
