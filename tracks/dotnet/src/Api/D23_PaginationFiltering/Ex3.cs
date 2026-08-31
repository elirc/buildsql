// d23_pagination_filtering / ex3 - sorting from a whitelist, with a tiebreak.
// See lessons/d23_pagination_filtering/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D23_PaginationFiltering;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d23/postings/sorted", Sorted);
    }

    // 200 with one page of PostingCards ordered by ?sort=, which must be one
    // of D23Board.Sorts and defaults to "postedDay". A leading minus reverses
    // the column. Every order ends with Id ascending as the tiebreak. Anything
    // outside the whitelist is 400 keyed "sort". ?page= and ?size= work
    // exactly as in ex1.
    private static async Task<IResult> Sorted(D23Db db, string? sort, int? page, int? size)
    {
        // TODO ex3: sort is accepted and then thrown away - every request gets
        // id order, so ?sort=salaryMax and ?sort=nonsense produce identical
        // answers and neither the working client nor the broken one can tell.
        int p = page ?? 1;
        int s = size ?? 10;

        var items = await db.Postings
            .OrderBy(x => x.Id)
            .Skip((p - 1) * s)
            .Take(s)
            .Select(D23Cards.Card)
            .ToListAsync();

        return TypedResults.Ok(items);
    }
}
