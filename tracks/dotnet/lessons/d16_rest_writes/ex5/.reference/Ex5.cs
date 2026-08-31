// d16_rest_writes / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPatch("/d16/jobs/{id:int}", Patch);
    }

    private static async Task<IResult> Patch(int id, JobPatch body, D16Db db)
    {
        var job = await db.Jobs.FirstOrDefaultAsync(j => j.Id == id);
        if (job is null)
        {
            return TypedResults.NotFound();
        }

        // Every rule is guarded by "was this field present at all?". A field
        // that IS present is validated exactly as PUT validates it.
        var errors = new Dictionary<string, string[]>();

        if (body.Title is not null && body.Title.Trim().Length == 0)
        {
            errors["title"] = ["A job needs a title."];
        }

        if (body.Copies is not null && body.Copies < 1)
        {
            errors["copies"] = ["Copies must be at least 1."];
        }

        if (body.Status is not null && !D16Queue.Statuses.Contains(body.Status))
        {
            errors["status"] = ["That is not one of: " + string.Join(", ", D16Queue.Statuses) + "."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        if (body.Title is not null)
        {
            job.Title = body.Title.Trim();
        }

        if (body.Copies is not null)
        {
            job.Copies = body.Copies.Value;
        }

        if (body.Status is not null)
        {
            job.Status = body.Status;
        }

        job.Version++;
        await db.SaveChangesAsync();

        return TypedResults.Ok(D16Queue.ToDto(job));
    }
}
