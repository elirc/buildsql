// d20_auth_jwt / ex6 - anonymous is allowed, and gets less.
// See lessons/d20_auth_jwt/README.md, "Exercise 6".

using Microsoft.AspNetCore.Authentication;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // Deliberately NOT RequireAuthorization: anyone may call this.
        app.MapGet("/d20/entries/{id:int}/preview", Preview);
    }

    // 404 when there is no such entry. Otherwise 200 with a PreviewDto:
    // always the title, and the body only when the caller presents a valid
    // d20-bearer token whose subject owns the entry, or who is a keeper.
    // Everyone else - including a caller with no token, or a token that does
    // not validate - gets a null body rather than a 401.
    private static Task<IResult> Preview(int id, D20Vault vault, HttpContext http) =>
        throw new NotImplementedException(
            "ex6: GET /d20/entries/{id}/preview is not implemented yet - edit src/Api/D20_AuthJwt/Ex6.cs");
}
