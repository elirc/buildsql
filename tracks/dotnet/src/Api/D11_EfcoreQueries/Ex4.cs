// d11_efcore_queries / ex4 - counting and averaging without loading.
// See lessons/d11_efcore_queries/README.md, "Exercise 4".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/courses/{id:int}/stats", GetStats);
    }

    // 200 with {"title": …, "enrolled": …, "averageScore": …} for one course,
    // 404 when there is no such course.
    //
    // The average is a whole number, and a course nobody is enrolled on has an
    // average of 0 rather than an exception.
    private static Task<IResult> GetStats(D11Db db, int id) =>
        throw new NotImplementedException(
            "ex4: GET /d11/courses/{id:int}/stats is not implemented yet - edit src/Api/D11_EfcoreQueries/Ex4.cs");
}
