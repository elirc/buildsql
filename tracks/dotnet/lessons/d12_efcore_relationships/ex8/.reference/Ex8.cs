// d12_efcore_relationships / ex8 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d12/books/{id:int}/genres", SetGenres);
    }

    private static async Task<IResult> SetGenres(D12Db db, int id, List<string> request)
    {
        // The current set has to be loaded, or there is nothing to remove from.
        var book = await db.Books
            .Include(b => b.Genres)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book is null)
        {
            return TypedResults.NotFound();
        }

        var wanted = request.Distinct().ToList();
        var genres = await db.Genres.Where(g => wanted.Contains(g.Name)).ToListAsync();

        string? unknown = wanted.FirstOrDefault(name => genres.All(g => g.Name != name));

        if (unknown is not null)
        {
            return TypedResults.BadRequest($"'{unknown}' is not a genre.");
        }

        book.Genres.Clear();
        book.Genres.AddRange(genres);

        // EF works out which join rows to insert and which to delete.
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
