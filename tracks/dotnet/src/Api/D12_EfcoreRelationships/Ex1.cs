// d12_efcore_relationships / ex1 - the "many" side does not come for free.
// See lessons/d12_efcore_relationships/README.md, "Exercise 1".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/authors/{id:int}", GetAuthor);
    }

    // 200 with {"id": …, "name": …, "books": [{"id": …, "title": …}]}, books
    // sorted by title A-Z. An author who has written nothing is a 200 with an
    // empty list; an author who does not exist is a 404.
    private static Task<IResult> GetAuthor(D12Db db, int id) =>
        throw new NotImplementedException(
            "ex1: GET /d12/authors/{id:int} is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex1.cs");
}
