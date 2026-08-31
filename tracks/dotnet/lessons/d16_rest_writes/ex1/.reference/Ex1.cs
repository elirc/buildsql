// d16_rest_writes / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d16/jobs", Create);
    }

    private static async Task<IResult> Create(NewJob body, D16Db db)
    {
        var job = new Job
        {
            Title = body.Title ?? "",
            Copies = body.Copies,
            Status = "queued",
            Version = 1,
        };

        db.Jobs.Add(job);
        await db.SaveChangesAsync();

        // The id only exists after SaveChanges, which is why the Location can
        // only be built here and not before the write.
        return TypedResults.Created($"/d16/jobs/{job.Id}", D16Queue.ToDto(job));
    }
}
