// d16_rest_writes / ex5 - PATCH changes only what was sent.
// See lessons/d16_rest_writes/README.md, "Exercise 5".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPatch("/d16/jobs/{id:int}", Patch);
    }

    // 404 for an unknown id. 400, as a validation problem, for a blank title
    // ("title"), copies below 1 ("copies") or an unknown status ("status").
    // Otherwise 200 with the FULL updated JobDto, having changed only the
    // fields that were actually present in the body.
    private static async Task<IResult> Patch(int id, JobPatch body, D16Db db)
    {
        var job = await db.Jobs.FirstOrDefaultAsync(j => j.Id == id);
        if (job is null)
        {
            return TypedResults.NotFound();
        }

        // TODO ex5: null does not mean "set it to nothing", it means "the
        // client did not mention this field". As shipped, one PATCH of copies
        // wipes the title.
        job.Title = body.Title ?? "";
        job.Copies = body.Copies ?? 0;
        job.Status = body.Status ?? "queued";
        job.Version++;
        await db.SaveChangesAsync();

        return TypedResults.Ok(D16Queue.ToDto(job));
    }
}
