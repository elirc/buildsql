// d11_efcore_queries / ex6 - the N+1, and the projection that kills it.
// See lessons/d11_efcore_queries/README.md, "Exercise 6".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/enrolments/overview", GetOverview);
    }

    // 200 with one row per enrolment - {"enrolmentId": …, "student": …,
    // "course": …, "score": …} - id ascending, in ONE SQL command.
    private static async Task<IResult> GetOverview(D11Db db)
    {
        // TODO ex6: the values are already right. Count the commands and fix
        // what that tells you.
        var enrolments = await db.Enrolments.OrderBy(e => e.Id).ToListAsync();

        var rows = new List<OverviewRow>();

        foreach (var enrolment in enrolments)
        {
            var student = await db.Students.FirstAsync(s => s.Id == enrolment.StudentId);
            var course = await db.Courses.FirstAsync(c => c.Id == enrolment.CourseId);

            rows.Add(new OverviewRow(enrolment.Id, student.Name, course.Title, enrolment.Score));
        }

        return TypedResults.Ok(rows);
    }
}
