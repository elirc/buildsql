// d16_rest_writes / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d16/jobs/{id:int}", Read);
        app.MapPut("/d16/jobs/{id:int}/copies", SetCopies);
    }

    private static async Task<IResult> Read(int id, D16Db db, HttpContext http)
    {
        var job = await db.Jobs.AsNoTracking().FirstOrDefaultAsync(j => j.Id == id);
        if (job is null)
        {
            return TypedResults.NotFound();
        }

        http.Response.Headers.ETag = Tag(job.Version);

        return TypedResults.Ok(D16Queue.ToDto(job));
    }

    private static async Task<IResult> SetCopies(int id, CopyChange body, D16Db db, HttpContext http)
    {
        var job = await db.Jobs.FirstOrDefaultAsync(j => j.Id == id);
        if (job is null)
        {
            return TypedResults.NotFound();
        }

        // No precondition at all: the client never read this resource, so it
        // could not be told it lost a race. Ask for one rather than guessing.
        var conditions = http.Request.Headers.IfMatch;
        if (conditions.Count == 0)
        {
            return TypedResults.StatusCode(StatusCodes.Status428PreconditionRequired);
        }

        // A precondition that does not hold: somebody wrote between the
        // client's read and this write. Refuse, change nothing, let it re-read.
        string current = Tag(job.Version);
        if (!conditions.Any(value => value == current))
        {
            return TypedResults.StatusCode(StatusCodes.Status412PreconditionFailed);
        }

        job.Copies = body.Copies;
        job.Version++;
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }

    /// <summary>Given: the entity tag for a version. Use it, do not edit it.</summary>
    public static string Tag(int version) => $"\"v{version}\"";
}
