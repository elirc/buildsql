// d20_auth_jwt / ex7 - the same endpoint, two different worlds.
// See lessons/d20_auth_jwt/README.md, "Exercise 7".

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d20/reports", Reports).RequireAuthorization(D20Policies.Caller);
    }

    // 403 when the token's scope claim does not contain D20Scopes.Read.
    // Otherwise 200 with EntryDtos, id ascending: every entry for a keeper,
    // and only the caller's own for anybody else. The response also carries
    // the header "X-Result-Scope" with the value "all" or "own", saying which
    // of those two answers this is.
    private static IResult Reports(ClaimsPrincipal user, D20Vault vault, HttpContext http) =>
        throw new NotImplementedException(
            "ex7: GET /d20/reports is not implemented yet - edit src/Api/D20_AuthJwt/Ex7.cs");
}
