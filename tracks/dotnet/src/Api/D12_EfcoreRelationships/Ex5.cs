// d12_efcore_relationships / ex5 - load some of the children, not all of them.
// See lessons/d12_efcore_relationships/README.md, "Exercise 5".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/books/{id:int}/reviews", GetReviews);
    }

    // 200 with {"title": …, "reviews": [{"reviewer": …, "stars": …}]} - only
    // the reviews of at least minStars, sorted by reviewer A-Z. minStars
    // defaults to 0. 404 when there is no such book.
    //
    // The filtering happens in the database: ONE SQL command, and the reviews
    // that did not qualify are never fetched.
    private static Task<IResult> GetReviews(D12Db db, int id, int? minStars) =>
        throw new NotImplementedException(
            "ex5: GET /d12/books/{id:int}/reviews is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex5.cs");
}
