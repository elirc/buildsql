// d23_pagination_filtering / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/feed", Feed);
    }

    private static async Task<IResult> Feed(
        D23Db db,
        string? after,
        int? size,
        string? sort,
        bool? remote,
        int? minSalary,
        string? tag)
    {
        int s = size ?? 5;
        if (s < 1 || s > D23Board.MaxSize)
        {
            return Bad("size", $"size must be between 1 and {D23Board.MaxSize}; got {s}.");
        }

        // The feed can only sort on the key its cursor was cut for.
        string key = sort ?? "postedDay";
        if (!D23Board.FeedSorts.Contains(key))
        {
            return Bad("sort", $"'{key}' is not a feed sort. Try one of: "
                + string.Join(", ", D23Board.FeedSorts) + ".");
        }

        bool descending = key == "-postedDay";

        int day = 0;
        int id = 0;
        if (after is not null && !D23Cursor.TryDecode(after, out day, out id))
        {
            // A cursor this endpoint cannot read is a client error, not an
            // instruction to start over.
            return Bad("after", "after is not a cursor this endpoint issued.");
        }

        IQueryable<Posting> q = db.Postings;

        // The filters are reapplied on every call: the cursor carries a
        // position in the order, not the result set it came from.
        if (remote is bool wantRemote)
        {
            q = q.Where(x => x.Remote == wantRemote);
        }

        if (minSalary is int floor)
        {
            q = q.Where(x => x.SalaryMax >= floor);
        }

        if (tag is not null)
        {
            string needle = "," + tag + ",";
            q = q.Where(x => ("," + x.Tags + ",").Contains(needle));
        }

        if (after is not null)
        {
            // The comparison follows the direction of travel, or the second
            // page hands back the first one and the client loops.
            q = descending
                ? q.Where(x => x.PostedDay < day || (x.PostedDay == day && x.Id < id))
                : q.Where(x => x.PostedDay > day || (x.PostedDay == day && x.Id > id));
        }

        q = descending
            ? q.OrderByDescending(x => x.PostedDay).ThenByDescending(x => x.Id)
            : q.OrderBy(x => x.PostedDay).ThenBy(x => x.Id);

        // Filter, order, cursor and limit are all still deferred, so this is
        // one SELECT no matter how many of them were supplied.
        var rows = await q.Take(s + 1).Select(D23Cards.Card).ToListAsync();

        bool more = rows.Count > s;
        List<PostingCard> items = more ? rows.Take(s).ToList() : rows;

        string? nextCursor = more
            ? D23Cursor.Encode(items[^1].PostedDay, items[^1].Id)
            : null;

        return TypedResults.Ok(new CursorPage(items, s, nextCursor));
    }

    private static IResult Bad(string key, string message) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]> { [key] = [message] });
}
