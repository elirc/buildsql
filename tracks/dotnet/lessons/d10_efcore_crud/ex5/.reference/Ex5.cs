// d10_efcore_crud / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d10/members/regrade", Regrade);
    }

    private static async Task<IResult> Regrade(D10Db db, string? from, string? to)
    {
        if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
        {
            return TypedResults.BadRequest("from and to are both required.");
        }

        // One UPDATE ... WHERE, sent straight to the database: nothing is
        // loaded, nothing is tracked, and SaveChanges is not involved.
        int changed = await db.Members
            .Where(m => m.Grade == from)
            .ExecuteUpdateAsync(setters => setters.SetProperty(m => m.Grade, to));

        return TypedResults.Ok(new ChangeResult(changed));
    }
}
