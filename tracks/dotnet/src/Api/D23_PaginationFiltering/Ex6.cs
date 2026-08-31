// d23_pagination_filtering / ex6 - keyset (cursor) pagination.
// See lessons/d23_pagination_filtering/README.md, "Exercise 6".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/keyset", Keyset);
    }

    // 200 with a CursorPage over (PostedDay ascending, Id ascending). ?after=
    // is an opaque cursor from D23Cursor and resumes immediately after the row
    // it names; absent means start at the beginning. ?size= defaults to 10 and
    // is 400 keyed "size" outside 1..D23Board.MaxSize. nextCursor is the key
    // of the last row on the page, or null when nothing follows it. One SQL
    // command.
    private static async Task<IResult> Keyset(D23Db db, string? after, int? size)
    {
        int s = size ?? 10;

        IQueryable<Posting> q = db.Postings;

        if (after is not null && D23Cursor.TryDecode(after, out int day, out int id))
        {
            // TODO ex6: this compares the first half of the key and forgets
            // the second. Postings 1 and 4 share day 12, so resuming after
            // (12,1) skips posting 4 - it drops out of the feed and no client
            // ever sees it. And nextCursor below is handed out even when this
            // was the last page, so the client walks off the end.
            q = q.Where(x => x.PostedDay > day);
        }

        var items = await q
            .OrderBy(x => x.PostedDay)
            .ThenBy(x => x.Id)
            .Take(s)
            .Select(D23Cards.Card)
            .ToListAsync();

        string? nextCursor = items.Count > 0
            ? D23Cursor.Encode(items[^1].PostedDay, items[^1].Id)
            : null;

        return TypedResults.Ok(new CursorPage(items, s, nextCursor));
    }
}
