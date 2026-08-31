// d10_efcore_crud / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d10/members", List);
    }

    private static async Task<IResult> List(D10Db db)
    {
        var members = await db.Members
            .OrderByDescending(m => m.Credits)
            .ThenBy(m => m.Name)
            .Select(m => new MemberSummary(m.Id, m.Name, m.Credits))
            .ToListAsync();

        return TypedResults.Ok(members);
    }
}
