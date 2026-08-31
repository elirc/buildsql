// d23_pagination_filtering / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/sorted", Sorted);
    }

    private static async Task<IResult> Sorted(D23Db db, string? sort, int? page, int? size)
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

        // A sort key is a vocabulary, not a column name the client gets to
        // choose. Check membership before the value reaches the query.
        string key = sort ?? "postedDay";
        if (!D23Board.Sorts.Contains(key))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["sort"] = [$"'{key}' is not a sort key. Try one of: "
                    + string.Join(", ", D23Board.Sorts) + "."],
            });
        }

        // Every branch ends in ThenBy(Id): the requested column decides the
        // order, and Id decides the ties, so a row cannot drift between pages.
        IQueryable<Posting> q = db.Postings;
        q = key switch
        {
            "postedDay" => q.OrderBy(x => x.PostedDay).ThenBy(x => x.Id),
            "-postedDay" => q.OrderByDescending(x => x.PostedDay).ThenBy(x => x.Id),
            "salaryMax" => q.OrderBy(x => x.SalaryMax).ThenBy(x => x.Id),
            "-salaryMax" => q.OrderByDescending(x => x.SalaryMax).ThenBy(x => x.Id),
            _ => q.OrderBy(x => x.Title).ThenBy(x => x.Id),
        };

        var items = await q
            .Skip((p - 1) * s)
            .Take(s)
            .Select(D23Cards.Card)
            .ToListAsync();

        return TypedResults.Ok(items);
    }
}
