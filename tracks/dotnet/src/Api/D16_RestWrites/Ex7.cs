// d16_rest_writes / ex7 - the write that has to prove it read the current one.
// See lessons/d16_rest_writes/README.md, "Exercise 7".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d16/jobs/{id:int}", Read);
        app.MapPut("/d16/jobs/{id:int}/copies", SetCopies);
    }

    // 200 with the JobDto and an ETag of Tag(job.Version), or 404.
    private static async Task<IResult> Read(int id, D16Db db, HttpContext http)
    {
        var job = await db.Jobs.AsNoTracking().FirstOrDefaultAsync(j => j.Id == id);
        if (job is null)
        {
            return TypedResults.NotFound();
        }

        // TODO ex7: without an ETag on the way out, a client has nothing to
        // send back on the way in, and ex7's whole protocol is impossible.
        return TypedResults.Ok(D16Queue.ToDto(job));
    }

    // 404 for an unknown id. 428 when the request carries no If-Match at all.
    // 412 when it carries one that is not the job's current tag - and nothing
    // is written. Otherwise 204: copies updated, Version bumped by one.
    private static Task<IResult> SetCopies(int id, CopyChange body, D16Db db, HttpContext http) =>
        throw new NotImplementedException(
            "ex7: PUT /d16/jobs/{id}/copies is not implemented yet - edit src/Api/D16_RestWrites/Ex7.cs");

    /// <summary>Given: the entity tag for a version. Use it, do not edit it.</summary>
    public static string Tag(int version) => $"\"v{version}\"";
}
