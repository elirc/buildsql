// d12_efcore_relationships / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/library", GetLibrary);
    }

    private static async Task<IResult> GetLibrary(D12Db db)
    {
        var library = await db.Authors
            .OrderBy(a => a.Name)
            .Select(a => new ShelfAuthor(
                a.Name,
                a.Books
                    .OrderBy(b => b.Title)
                    .Select(b => new ShelfBook(
                        b.Title,
                        b.Genres.OrderBy(g => g.Name).Select(g => g.Name).ToList()))
                    .ToList()))
            .ToListAsync();

        return TypedResults.Ok(library);
    }
}
