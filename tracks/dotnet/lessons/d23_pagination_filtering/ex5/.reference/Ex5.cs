// d23_pagination_filtering / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/linked", Linked);
    }

    private static async Task<IResult> Linked(D23Db db, int? page, int? size)
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

        int total = await db.Postings.CountAsync();
        int totalPages = (total + s - 1) / s;

        // Page 4 of a 3 page result is in RANGE and out of BOUNDS: the offset
        // is simply past the end, so the window is empty and everything else
        // about the answer stays true.
        var items = await db.Postings
            .OrderBy(x => x.Id)
            .Skip((p - 1) * s)
            .Take(s)
            .Select(D23Cards.Card)
            .ToListAsync();

        // The links carry the size the client chose, or the first click resets
        // it. prev exists whenever there is a page before this one - which is
        // still true when this page is past the end.
        string? prev = p > 1 ? $"/d23/postings/linked?page={p - 1}&size={s}" : null;
        string? next = p < totalPages ? $"/d23/postings/linked?page={p + 1}&size={s}" : null;

        return TypedResults.Ok(new LinkedPage(items, p, s, total, totalPages, next, prev));
    }
}
