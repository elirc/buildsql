// d12_efcore_relationships / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d12/authors/{id:int}/books", AddBook);
    }

    private static async Task<IResult> AddBook(D12Db db, int id, NewBook request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || request.Year < 1)
        {
            return TypedResults.BadRequest("title is required and year must be positive.");
        }

        if (!await db.Authors.AnyAsync(a => a.Id == id))
        {
            return TypedResults.NotFound();
        }

        // Setting the foreign key is enough; the navigation is optional.
        var book = new Book { Title = request.Title, Year = request.Year, AuthorId = id };

        db.Books.Add(book);

        await db.SaveChangesAsync();

        return TypedResults.Created(
            $"/d12/books/{book.Id}", new CreatedBook(book.Id, book.Title, book.Year));
    }
}
