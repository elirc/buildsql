// d11_efcore_queries / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/enrolments/overview", GetOverview);
    }

    private static async Task<IResult> GetOverview(D11Db db)
    {
        // e.Student!.Name is a join expressed as a property access. The `!` is
        // a message to the compiler; nothing is dereferenced in this process,
        // because the whole lambda is an expression tree EF translates.
        var rows = await db.Enrolments
            .OrderBy(e => e.Id)
            .Select(e => new OverviewRow(e.Id, e.Student!.Name, e.Course!.Title, e.Score))
            .ToListAsync();

        return TypedResults.Ok(rows);
    }
}
