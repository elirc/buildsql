// d16_rest_writes / ex6 - an action that the state can refuse.
// See lessons/d16_rest_writes/README.md, "Exercise 6".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d16/jobs/{id:int}/cancel", Cancel);
    }

    // 404 for an unknown id. 409 when the job is already finished (its status
    // is one of D16Queue.Finished) - and its status is left exactly as it was.
    // Otherwise 204, with the status now "cancelled".
    private static Task<IResult> Cancel(int id, D16Db db) =>
        throw new NotImplementedException(
            "ex6: POST /d16/jobs/{id}/cancel is not implemented yet - edit src/Api/D16_RestWrites/Ex6.cs");
}
