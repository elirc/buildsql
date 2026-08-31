// d11_efcore_queries / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/students/{id:int}/detail", GetDetail);
    }

    private static async Task<IResult> GetDetail(D11Db db, int id, bool? split)
    {
        var query = db.Students
            .Include(s => s.Enrolments)
            .ThenInclude(e => e.Course)
            .Where(s => s.Id == id);

        query = split == true ? query.AsSplitQuery() : query.AsSingleQuery();

        var student = await query.FirstOrDefaultAsync();

        if (student is null)
        {
            return TypedResults.NotFound();
        }

        var courses = student.Enrolments
            .Select(e => e.Course!.Title)
            .OrderBy(t => t, StringComparer.Ordinal)
            .ToList();

        return TypedResults.Ok(new StudentDetail(student.Name, courses));
    }
}
