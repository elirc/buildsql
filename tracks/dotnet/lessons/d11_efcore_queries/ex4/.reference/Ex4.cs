// d11_efcore_queries / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/courses/{id:int}/stats", GetStats);
    }

    private static async Task<IResult> GetStats(D11Db db, int id)
    {
        var course = await db.Courses.FindAsync(id);

        if (course is null)
        {
            return TypedResults.NotFound();
        }

        var enrolments = db.Enrolments.Where(e => e.CourseId == id);

        int enrolled = await enrolments.CountAsync();

        // Averaging int? gives null for an empty set instead of throwing.
        double average = await enrolments.Select(e => (int?)e.Score).AverageAsync() ?? 0;

        return TypedResults.Ok(new CourseStats(course.Title, enrolled, (int)average));
    }
}
