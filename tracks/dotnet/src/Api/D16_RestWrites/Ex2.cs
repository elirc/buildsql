// d16_rest_writes / ex2 - a delete that is honest about what it found.
// See lessons/d16_rest_writes/README.md, "Exercise 2".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/d16/jobs/{id:int}", Delete);
    }

    // 204 with no body when the job existed and is now gone; 404 when there
    // was nothing to delete.
    private static Task<IResult> Delete(int id, D16Db db) =>
        throw new NotImplementedException(
            "ex2: DELETE /d16/jobs/{id} is not implemented yet - edit src/Api/D16_RestWrites/Ex2.cs");
}
