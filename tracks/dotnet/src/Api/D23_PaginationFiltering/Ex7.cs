// d23_pagination_filtering / ex7 - filter, sort and cursor on one query.
// See lessons/d23_pagination_filtering/README.md, "Exercise 7".

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/feed", Feed);
    }

    // 200 with a CursorPage. ?remote=, ?minSalary= and ?tag= filter exactly as
    // in ex4; ?sort= is one of D23Board.FeedSorts and defaults to "postedDay";
    // ?after= is a D23Cursor over (PostedDay, Id) and follows the direction
    // the sort is going; ?size= defaults to 5. A sort outside the feed
    // whitelist is 400 keyed "sort" and a cursor D23Cursor.TryDecode cannot
    // read is 400 keyed "after". One SQL command, whatever was supplied.
    private static IResult Feed(
        D23Db db,
        string? after,
        int? size,
        string? sort,
        bool? remote,
        int? minSalary,
        string? tag) =>
        throw new NotImplementedException(
            "ex7: GET /d23/postings/feed is not implemented yet - edit src/Api/D23_PaginationFiltering/Ex7.cs");
}
