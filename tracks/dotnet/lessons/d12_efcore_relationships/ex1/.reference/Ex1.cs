// d12_efcore_relationships / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/authors/{id:int}", GetAuthor);
    }

    private static async Task<IResult> GetAuthor(D12Db db, int id)
    {
        // Projecting the collection loads it, without Include and without
        // fetching a single column nobody asked for.
        var author = await db.Authors
            .Where(a => a.Id == id)
            .Select(a => new AuthorDetail(
                a.Id,
                a.Name,
                a.Books
                    .OrderBy(b => b.Title)
                    .Select(b => new BookSummary(b.Id, b.Title))
                    .ToList()))
            .FirstOrDefaultAsync();

        return author is null ? TypedResults.NotFound() : TypedResults.Ok(author);
    }
}
