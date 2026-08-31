// d12_efcore_relationships / ex2 - many-to-many, walked both ways.
// See lessons/d12_efcore_relationships/README.md, "Exercise 2".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d12/books/{id:int}/genres", GetGenres);
        app.MapGet("/d12/genres/{name}/books", GetBooks);
    }

    // 200 with this book's genre names, sorted A-Z. 404 when there is no such
    // book - a book with no genres would be a 200 with an empty array.
    private static Task<IResult> GetGenres(D12Db db, int id) =>
        throw new NotImplementedException(
            "ex2: GET /d12/books/{id:int}/genres is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex2.cs");

    // 200 with the titles carrying this genre, sorted A-Z. 404 when there is no
    // such genre.
    private static Task<IResult> GetBooks(D12Db db, string name) =>
        throw new NotImplementedException(
            "ex2: GET /d12/genres/{name}/books is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex2.cs");
}
