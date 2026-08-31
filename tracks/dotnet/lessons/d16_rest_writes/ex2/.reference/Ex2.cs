// d16_rest_writes / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/d16/jobs/{id:int}", Delete);
    }

    private static async Task<IResult> Delete(int id, D16Db db)
    {
        var job = await db.Jobs.FirstOrDefaultAsync(j => j.Id == id);
        if (job is null)
        {
            return TypedResults.NotFound();
        }

        db.Jobs.Remove(job);
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
