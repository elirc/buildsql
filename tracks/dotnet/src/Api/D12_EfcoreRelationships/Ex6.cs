// d12_efcore_relationships / ex6 - aggregate across two hops.
// See lessons/d12_efcore_relationships/README.md, "Exercise 6".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/authors/ratings", GetRatings);
    }

    // 200 with one row per author - {"author": …, "books": …,
    // "averageStars": …} - sorted by author name A-Z, in ONE SQL command.
    //
    // The average is over every review of every one of that author's books,
    // truncated to a whole number. An author with no reviews averages 0, and an
    // author with no books still appears.
    private static Task<IResult> GetRatings(D12Db db) =>
        throw new NotImplementedException(
            "ex6: GET /d12/authors/ratings is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex6.cs");
}
