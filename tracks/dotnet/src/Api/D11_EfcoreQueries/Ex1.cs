// d11_efcore_queries / ex1 - filter, then sort, on the database.
// See lessons/d11_efcore_queries/README.md, "Exercise 1".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/students", ListStudents);
    }

    // 200 with the students' names, sorted A-Z. An optional country narrows
    // them; a country nobody is from is an empty array, not a 404.
    private static Task<IResult> ListStudents(D11Db db, string? country) =>
        throw new NotImplementedException(
            "ex1: GET /d11/students is not implemented yet - edit src/Api/D11_EfcoreQueries/Ex1.cs");
}
