// d12_efcore_relationships / ex7 - two levels of collection, one query.
// See lessons/d12_efcore_relationships/README.md, "Exercise 7".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/library", GetLibrary);
    }

    // 200 with every author, their books and each book's genres:
    //   [{"author": …, "books": [{"title": …, "genres": [ … ]}]}]
    // authors by name, books by title, genres by name - all A-Z, and an author
    // with no books still appears with an empty list.
    //
    // ONE SQL command for the whole shape.
    private static Task<IResult> GetLibrary(D12Db db) =>
        throw new NotImplementedException(
            "ex7: GET /d12/library is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex7.cs");
}
