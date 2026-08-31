// d11_efcore_queries / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/courses", ListCourses);
    }

    private static async Task<IResult> ListCourses(D11Db db)
    {
        var courses = await db.Courses
            .OrderBy(c => c.Title)
            .Select(c => new CourseSummary(c.Id, c.Title, c.Credits))
            .ToListAsync();

        return TypedResults.Ok(courses);
    }
}
