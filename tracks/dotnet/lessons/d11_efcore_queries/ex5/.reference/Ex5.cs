// d11_efcore_queries / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/enrolments", ListEnrolments);
    }

    private static async Task<IResult> ListEnrolments(D11Db db, int? page, int? size)
    {
        int wanted = page ?? 1;
        int perPage = size ?? 3;

        if (wanted < 1 || perPage < 1 || perPage > 50)
        {
            return TypedResults.BadRequest("page is 1-based and size must be between 1 and 50.");
        }

        var query = db.Enrolments.OrderBy(e => e.Id);

        int total = await query.CountAsync();

        var items = await query
            .Skip((wanted - 1) * perPage)
            .Take(perPage)
            .Select(e => new EnrolmentItem(e.Id, e.Score))
            .ToListAsync();

        return TypedResults.Ok(new EnrolmentPage(items, total, wanted, perPage));
    }
}
