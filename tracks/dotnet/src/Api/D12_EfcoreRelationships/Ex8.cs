// d12_efcore_relationships / ex8 - replacing the far side of a many-to-many.
// See lessons/d12_efcore_relationships/README.md, "Exercise 8".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D12_EfcoreRelationships;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d12/books/{id:int}/genres", SetGenres);
    }

    // PUT replaces the whole set, so the body is the complete list of genre
    // names this book should have afterwards.
    //
    //   204  the book now carries exactly those genres, no more and no fewer
    //   404  there is no such book
    //   400  a name that is not a genre, quoting it - and nothing changes
    //
    // An empty array is a valid request: it means "no genres".
    private static Task<IResult> SetGenres(D12Db db, int id, List<string> request) =>
        throw new NotImplementedException(
            "ex8: PUT /d12/books/{id:int}/genres is not implemented yet - edit src/Api/D12_EfcoreRelationships/Ex8.cs");
}
