// d24_mixed_gauntlet / ex7 - authorization, EF Core, problem details, logging.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 7".

using System.Security.Claims;

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d24/tickets/{id:int}/cancel", Cancel).RequireAuthorization(D24Policies.Visitor);
    }

    // 404 when there is no such ticket AND when it belongs to somebody else
    // and the caller is not a curator - the two must be indistinguishable.
    // 409 problem details, type D24Problems.Base + "already-cancelled", when
    // it is already cancelled. Otherwise 204 with Cancelled written.
    // Exactly one entry per request: Information for the 404 and the success,
    // Warning for the 409.
    private static Task<IResult> Cancel(
        int id, ClaimsPrincipal user, D24Db db, ILogger<Ex7> logger, HttpContext http) =>
        throw new NotImplementedException(
            "ex7: POST /d24/tickets/{id}/cancel is not implemented yet - edit src/Api/D24_MixedGauntlet/Ex7.cs");
}
