// d12_efcore_relationships / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/books/{id:int}/genres", GetGenres);
        app.MapGet("/d12/genres/{name}/books", GetBooks);
    }

    private static async Task<IResult> GetGenres(D12Db db, int id)
    {
        if (!await db.Books.AnyAsync(b => b.Id == id))
        {
            return TypedResults.NotFound();
        }

        var names = await db.Books
            .Where(b => b.Id == id)
            .SelectMany(b => b.Genres)
            .Select(g => g.Name)
            .OrderBy(n => n)
            .ToListAsync();

        return TypedResults.Ok(names);
    }

    private static async Task<IResult> GetBooks(D12Db db, string name)
    {
        if (!await db.Genres.AnyAsync(g => g.Name == name))
        {
            return TypedResults.NotFound();
        }

        // The same join table, walked the other way - and you never named it.
        var titles = await db.Genres
            .Where(g => g.Name == name)
            .SelectMany(g => g.Books)
            .Select(b => b.Title)
            .OrderBy(t => t)
            .ToListAsync();

        return TypedResults.Ok(titles);
    }
}
