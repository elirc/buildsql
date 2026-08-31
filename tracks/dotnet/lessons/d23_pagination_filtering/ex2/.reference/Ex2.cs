// d23_pagination_filtering / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/page", Page);
    }

    private static async Task<IResult> Page(D23Db db, int? page, int? size)
    {
        int p = page ?? 1;
        int s = size ?? 10;

        if (p < 1)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["page"] = [$"page must be 1 or greater; got {p}."],
            });
        }

        if (s < 1 || s > D23Board.MaxSize)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["size"] = [$"size must be between 1 and {D23Board.MaxSize}; got {s}."],
            });
        }

        // Two round trips, both scalar-cheap: SELECT COUNT(*) and one windowed
        // SELECT. Counting by materialising the table would make the total the
        // most expensive part of a paged response.
        int total = await db.Postings.CountAsync();

        var items = await db.Postings
            .OrderBy(x => x.Id)
            .Skip((p - 1) * s)
            .Take(s)
            .Select(D23Cards.Card)
            .ToListAsync();

        // Ceiling division without floating point: 25 rows in tens is 3 pages.
        int totalPages = (total + s - 1) / s;

        return TypedResults.Ok(new PostingPage(items, p, s, total, totalPages));
    }
}
