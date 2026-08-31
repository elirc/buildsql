// d11_efcore_queries / ex3 - let the database do the arithmetic.
// See lessons/d11_efcore_queries/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/subjects", ListSubjects);
    }

    // 200 with one row per subject - {"subject": …, "courses": …,
    // "totalCredits": …} - sorted by subject A-Z, in ONE SQL command.
    private static Task<IResult> ListSubjects(D11Db db) =>
        throw new NotImplementedException(
            "ex3: GET /d11/subjects is not implemented yet - edit src/Api/D11_EfcoreQueries/Ex3.cs");
}
