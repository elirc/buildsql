// d23_pagination_filtering / ex1 - offset paging, defaults and bounds.
// See lessons/d23_pagination_filtering/README.md, "Exercise 1".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings", List);
    }

    // 200 with one page of PostingCards, id ascending. ?page= defaults to 1
    // and ?size= to 10. page below 1 is 400 as a validation problem keyed
    // "page"; size outside 1..D23Board.MaxSize is 400 keyed "size".
    private static async Task<IResult> List(D23Db db, int? page, int? size)
    {
        // TODO ex1: two bugs. The offset is page*size, so page 1 skips the
        // first ten rows and nobody ever sees posting 1 - the first page skips
        // NOTHING. And page and size arrive unchecked, so ?page=0 quietly
        // skips a negative number of rows instead of answering 400.
        int p = page ?? 1;
        int s = size ?? 10;

        var items = await db.Postings
            .OrderBy(x => x.Id)
            .Skip(p * s)
            .Take(s)
            .Select(D23Cards.Card)
            .ToListAsync();

        return TypedResults.Ok(items);
    }
}
