// d12_efcore_relationships / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/authors/ratings", GetRatings);
    }

    private static async Task<IResult> GetRatings(D12Db db)
    {
        // SelectMany walks the second hop, and averaging a double? turns the
        // database's NULL into null instead of an exception.
        var ratings = await db.Authors
            .OrderBy(a => a.Name)
            .Select(a => new AuthorRating(
                a.Name,
                a.Books.Count,
                (int)(a.Books.SelectMany(b => b.Reviews).Average(r => (double?)r.Stars) ?? 0)))
            .ToListAsync();

        return TypedResults.Ok(ratings);
    }
}
