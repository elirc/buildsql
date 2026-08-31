// d12_efcore_relationships / ex4 - what happens to the children.
// See lessons/d12_efcore_relationships/README.md, "Exercise 4".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/d12/books/{id:int}", DeleteBook);
    }

    // 204 when the book was there and is now gone, 404 when it was not.
    //
    // Its reviews go with it, and so do its rows in the book-genre join table -
    // without you writing a line about either.
    private static Task<IResult> DeleteBook(D12Db db, int id) =>
        throw new NotImplementedException(
            "ex4: DELETE /d12/books/{id:int} is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex4.cs");
}
