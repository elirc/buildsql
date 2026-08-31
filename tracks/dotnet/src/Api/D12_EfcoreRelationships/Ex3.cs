// d12_efcore_relationships / ex3 - create a child of an existing parent.
// See lessons/d12_efcore_relationships/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d12/authors/{id:int}/books", AddBook);
    }

    // 201 with a Location of /d12/books/{id} and {"id": …, "title": …,
    // "year": …}, attached to this author.
    //
    // 404 when the author does not exist; 400 for a blank title or a year
    // below 1, writing nothing.
    private static Task<IResult> AddBook(D12Db db, int id, NewBook request) =>
        throw new NotImplementedException(
            "ex3: POST /d12/authors/{id:int}/books is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex3.cs");
}
