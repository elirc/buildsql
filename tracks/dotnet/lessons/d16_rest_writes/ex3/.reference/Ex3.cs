// d16_rest_writes / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d16/jobs/{id:int}", Replace);
    }

    private static async Task<IResult> Replace(int id, JobReplacement body, D16Db db)
    {
        var job = await db.Jobs.FirstOrDefaultAsync(j => j.Id == id);
        if (job is null)
        {
            return TypedResults.NotFound();
        }

        // Everything is decided BEFORE the entity is touched. A tracked entity
        // that has already been assigned is a change waiting for the next
        // SaveChanges, whatever the handler decides to return.
        var errors = new Dictionary<string, string[]>();

        string title = body.Title?.Trim() ?? "";
        if (title.Length == 0)
        {
            errors["title"] = ["A job needs a title."];
        }

        if (body.Copies < 1)
        {
            errors["copies"] = ["Copies must be at least 1."];
        }

        // An omitted status is not an error; it is the default, because PUT
        // replaces the resource rather than editing it.
        string status = body.Status ?? "queued";
        if (!D16Queue.Statuses.Contains(status))
        {
            errors["status"] = [$"'{status}' is not one of: " + string.Join(", ", D16Queue.Statuses) + "."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        job.Title = title;
        job.Copies = body.Copies;
        job.Status = status;
        job.Version++;
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
