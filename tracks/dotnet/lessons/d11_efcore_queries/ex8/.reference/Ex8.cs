// d11_efcore_queries / ex8 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/search", Search);
    }

    private static async Task<IResult> Search(
        D11Db db, string? subject, int? minScore, string? sort, int? page, int? size)
    {
        string order = sort ?? "score";
        int wanted = page ?? 1;
        int perPage = size ?? 3;

        if (order is not ("score" or "student" or "course"))
        {
            return TypedResults.BadRequest($"'{order}' is not a sort.");
        }

        if (wanted < 1 || perPage < 1 || perPage > 20)
        {
            return TypedResults.BadRequest("page is 1-based and size must be between 1 and 20.");
        }

        // Compose the filters onto the IQueryable; nothing has run yet.
        var query = db.Enrolments.AsQueryable();

        if (!string.IsNullOrWhiteSpace(subject))
        {
            query = query.Where(e => e.Course!.Subject == subject);
        }

        if (minScore is not null)
        {
            query = query.Where(e => e.Score >= minScore);
        }

        int total = await query.CountAsync();

        var ordered = order switch
        {
            "student" => query.OrderBy(e => e.Student!.Name).ThenBy(e => e.Id),
            "course" => query.OrderBy(e => e.Course!.Title).ThenBy(e => e.Id),
            _ => query.OrderByDescending(e => e.Score).ThenBy(e => e.Id),
        };

        var items = await ordered
            .Skip((wanted - 1) * perPage)
            .Take(perPage)
            .Select(e => new SearchRow(e.Student!.Name, e.Course!.Title, e.Score))
            .ToListAsync();

        return TypedResults.Ok(new SearchPage(items, total));
    }
}
