// d16_rest_writes / ex4 - the retry that must not print twice.
// See lessons/d16_rest_writes/README.md, "Exercise 4".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d16/rush", Rush);
    }

    // Creates a job with status "printing", keyed by the Idempotency-Key
    // header. No header: 400 as a validation problem keyed "Idempotency-Key".
    // A key never seen before: 201 + Location + the new JobDto. A key already
    // used: 200 + the SAME JobDto and the same Location, and no second row -
    // whatever the body says this time.
    private static async Task<IResult> Rush(NewJob body, D16Db db, HttpContext http)
    {
        // TODO ex4: the key is never read, so every retry of a timed-out
        // request prints the run again.
        var job = new Job
        {
            Title = body.Title ?? "",
            Copies = body.Copies,
            Status = "printing",
            Version = 1,
        };

        db.Jobs.Add(job);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/d16/jobs/{job.Id}", D16Queue.ToDto(job));
    }
}
