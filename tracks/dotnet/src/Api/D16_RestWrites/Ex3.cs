// d16_rest_writes / ex3 - PUT replaces the whole thing.
// See lessons/d16_rest_writes/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d16/jobs/{id:int}", Replace);
    }

    // 404 for an unknown id. 400, as a validation problem, for a blank title
    // ("title"), copies below 1 ("copies") or a status outside
    // D16Queue.Statuses ("status") - and nothing is written. Otherwise 204,
    // having REPLACED the job: an omitted status becomes "queued", because
    // that is what replacing means.
    private static Task<IResult> Replace(int id, JobReplacement body, D16Db db) =>
        throw new NotImplementedException(
            "ex3: PUT /d16/jobs/{id} is not implemented yet - edit src/Api/D16_RestWrites/Ex3.cs");
}
