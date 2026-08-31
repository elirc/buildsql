// d11_efcore_queries / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/students", ListStudents);
    }

    private static async Task<IResult> ListStudents(D11Db db, string? country)
    {
        // Still an IQueryable: nothing has run yet, so the filter joins the SQL.
        var query = db.Students.AsQueryable();

        if (!string.IsNullOrWhiteSpace(country))
        {
            query = query.Where(s => s.Country == country);
        }

        var names = await query
            .OrderBy(s => s.Name)
            .Select(s => s.Name)
            .ToListAsync();

        return TypedResults.Ok(names);
    }
}
