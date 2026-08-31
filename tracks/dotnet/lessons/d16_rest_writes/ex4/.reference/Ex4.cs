// d16_rest_writes / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d16/rush", Rush);
    }

    private static async Task<IResult> Rush(NewJob body, D16Db db, HttpContext http)
    {
        string? key = http.Request.Headers["Idempotency-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(key))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["Idempotency-Key"] = ["This endpoint cannot be retried safely without a key."],
            });
        }

        // The key is the request's identity. If it has been seen, the answer
        // is the one that was given the first time - the new payload is a
        // retry of the old request, not a new one.
        var already = await db.Jobs.FirstOrDefaultAsync(j => j.IdempotencyKey == key);
        if (already is not null)
        {
            http.Response.Headers.Location = $"/d16/jobs/{already.Id}";
            return TypedResults.Ok(D16Queue.ToDto(already));
        }

        var job = new Job
        {
            Title = body.Title ?? "",
            Copies = body.Copies,
            Status = "printing",
            Version = 1,
            IdempotencyKey = key,
        };

        db.Jobs.Add(job);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/d16/jobs/{job.Id}", D16Queue.ToDto(job));
    }
}
