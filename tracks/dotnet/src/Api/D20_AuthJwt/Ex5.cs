// d20_auth_jwt / ex5 - a scope is a whole word.
// See lessons/d20_auth_jwt/README.md, "Exercise 5".

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d20/entries/{id:int}/publish", Publish)
            .RequireAuthorization(D20Policies.Caller);
    }

    // 403 when the token's "scope" claim does not contain D20Scopes.Write.
    // 404 when there is no such entry, or it belongs to somebody else and the
    // caller is not a keeper. Otherwise 204, with Published set to true.
    private static IResult Publish(int id, ClaimsPrincipal user, D20Vault vault)
    {
        var entry = vault.Find(id);
        if (entry is null || (entry.Owner != user.Identity?.Name && !user.IsInRole("keeper")))
        {
            return TypedResults.NotFound();
        }

        // TODO ex5: the scope claim is never looked at, so a read-only token
        // can publish. D20Scopes.Has is given - use it, and do not reach for
        // Contains on the raw claim string.
        entry.Published = true;

        return TypedResults.NoContent();
    }
}
