// d23_pagination_filtering / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/keyset", Keyset);
    }

    private static async Task<IResult> Keyset(D23Db db, string? after, int? size)
    {
        int s = size ?? 10;
        if (s < 1 || s > D23Board.MaxSize)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["size"] = [$"size must be between 1 and {D23Board.MaxSize}; got {s}."],
            });
        }

        IQueryable<Posting> q = db.Postings;

        if (after is not null)
        {
            if (!D23Cursor.TryDecode(after, out int day, out int id))
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["after"] = ["after is not a cursor this endpoint issued."],
                });
            }

            // The whole composite key, not just its first column. Postings 1
            // and 4 share day 12; comparing PostedDay alone would skip 4.
            q = q.Where(x => x.PostedDay > day || (x.PostedDay == day && x.Id > id));
        }

        // Ask for one row more than the page. Its existence is the answer to
        // "is there more", so no second COUNT is needed.
        var rows = await q
            .OrderBy(x => x.PostedDay)
            .ThenBy(x => x.Id)
            .Take(s + 1)
            .Select(D23Cards.Card)
            .ToListAsync();

        bool more = rows.Count > s;
        List<PostingCard> items = more ? rows.Take(s).ToList() : rows;

        string? nextCursor = more
            ? D23Cursor.Encode(items[^1].PostedDay, items[^1].Id)
            : null;

        return TypedResults.Ok(new CursorPage(items, s, nextCursor));
    }
}
