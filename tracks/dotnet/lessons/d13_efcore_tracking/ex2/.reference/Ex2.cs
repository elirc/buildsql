// d13_efcore_tracking / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d13/vans/{id:int}/mileage", Update);
    }

    private static async Task<IResult> Update(int id, MileageChange request, D13Db db)
    {
        var van = await db.Vans.FirstOrDefaultAsync(v => v.Id == id);
        if (van is null)
        {
            return TypedResults.NotFound();
        }

        if (request.Mileage < van.Mileage)
        {
            return TypedResults.BadRequest("odometers do not run backwards.");
        }

        // Assign and save. The tracker noticed the assignment; the UPDATE
        // touches only the mileage column, and every other column survives.
        van.Mileage = request.Mileage;
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
