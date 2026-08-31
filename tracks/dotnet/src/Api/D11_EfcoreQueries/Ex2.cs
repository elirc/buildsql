// d11_efcore_queries / ex2 - ask for the columns you need.
// See lessons/d11_efcore_queries/README.md, "Exercise 2".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/courses", ListCourses);
    }

    // 200 with every course as a CourseSummary - id, title and credits only -
    // sorted by title A-Z. "subject" must not appear in the response at all.
    private static Task<IResult> ListCourses(D11Db db) =>
        throw new NotImplementedException(
            "ex2: GET /d11/courses is not implemented yet - edit src/Api/D11_EfcoreQueries/Ex2.cs");
}
