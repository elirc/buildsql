// d16_rest_writes / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d16/jobs/{id:int}/cancel", Cancel);
    }

    private static async Task<IResult> Cancel(int id, D16Db db)
    {
        var job = await db.Jobs.FirstOrDefaultAsync(j => j.Id == id);
        if (job is null)
        {
            return TypedResults.NotFound();
        }

        // Not 400 - the request is perfectly well formed. Not 404 - the job is
        // right there. The resource's STATE is what refuses.
        if (D16Queue.Finished.Contains(job.Status))
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "The job is already finished.",
                detail: $"Job {id} is {job.Status}, and a finished job cannot be cancelled.");
        }

        job.Status = "cancelled";
        job.Version++;
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
