// d22_integration_testing / ex6 - order-independent, and safe to call twice.
// See lessons/d22_integration_testing/README.md, "Exercise 6".

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/returns/{loanId:int}", Shelve);
        app.MapGet("/d22/returns", Shelved);
    }

    // 404 when loanId names no seeded loan; otherwise 200 with
    // {"loanId", "alreadyReturned", "returnedCount"}. Calling it twice with
    // the same id must not change returnedCount the second time.
    private static IResult Shelve(int loanId, ReturnsLog log) =>
        throw new NotImplementedException(
            "ex6: POST /d22/returns/{loanId} is not implemented yet - edit src/Api/D22_IntegrationTesting/Ex6.cs");

    // 200 with {"returned": [ids ASCENDING], "count": n}.
    private static IResult Shelved(ReturnsLog log) =>
        throw new NotImplementedException(
            "ex6: GET /d22/returns is not implemented yet - edit src/Api/D22_IntegrationTesting/Ex6.cs");
}
