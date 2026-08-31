// d12_efcore_relationships / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/d12/books/{id:int}", DeleteBook);
    }

    private static async Task<IResult> DeleteBook(D12Db db, int id)
    {
        var book = await db.Books.FindAsync(id);

        if (book is null)
        {
            return TypedResults.NotFound();
        }

        // Review.BookId is required, so the relationship is cascade-delete by
        // convention: the reviews go with the book, and the join rows with them.
        db.Books.Remove(book);

        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
