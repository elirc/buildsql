// d11_efcore_queries / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/subjects", ListSubjects);
    }

    private static async Task<IResult> ListSubjects(D11Db db)
    {
        // GroupBy over an IQueryable becomes GROUP BY, so the counting and the
        // summing happen in the database and only two rows come back.
        //
        // The aggregates are projected into an ANONYMOUS type: EF cannot
        // translate a group projection whose arguments are fed into a
        // constructor, so the record is built afterwards, in memory, from two
        // rows that have already arrived.
        var grouped = await db.Courses
            .GroupBy(c => c.Subject)
            .Select(g => new
            {
                Subject = g.Key,
                Courses = g.Count(),
                TotalCredits = g.Sum(c => c.Credits),
            })
            .OrderBy(t => t.Subject)
            .ToListAsync();

        var totals = grouped
            .Select(t => new SubjectTotals(t.Subject, t.Courses, t.TotalCredits))
            .ToList();

        return TypedResults.Ok(totals);
    }
}
