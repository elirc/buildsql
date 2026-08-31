// d23_pagination_filtering / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings", List);
    }

    private static async Task<IResult> List(D23Db db, int? page, int? size)
    {
        // Bind the defaults first, then validate the values the client actually
        // asked for. "Absent" is legal; "present and out of range" is not.
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

        // Page 1 skips nothing, so the offset is (page - 1) * size. OrderBy is
        // not optional: LIMIT/OFFSET over an unordered set is undefined.
        var items = await db.Postings
            .OrderBy(x => x.Id)
            .Skip((p - 1) * s)
            .Take(s)
            .Select(D23Cards.Card)
            .ToListAsync();

        return TypedResults.Ok(items);
    }
}
