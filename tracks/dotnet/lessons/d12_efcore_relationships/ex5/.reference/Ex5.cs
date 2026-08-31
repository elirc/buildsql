// d12_efcore_relationships / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/books/{id:int}/reviews", GetReviews);
    }

    private static async Task<IResult> GetReviews(D12Db db, int id, int? minStars)
    {
        int floor = minStars ?? 0;

        var book = await db.Books
            .Where(b => b.Id == id)
            .Select(b => new BookReviews(
                b.Title,
                b.Reviews
                    .Where(r => r.Stars >= floor)
                    .OrderBy(r => r.Reviewer)
                    .Select(r => new ReviewLine(r.Reviewer, r.Stars))
                    .ToList()))
            .FirstOrDefaultAsync();

        return book is null ? TypedResults.NotFound() : TypedResults.Ok(book);
    }
}
