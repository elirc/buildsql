// d20_auth_jwt / ex5 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d20/entries/{id:int}/publish", Publish)
            .RequireAuthorization(D20Policies.Caller);
    }

    private static IResult Publish(int id, ClaimsPrincipal user, D20Vault vault)
    {
        // The scope decides whether this operation is permitted at all, so it
        // is answered before anything is looked up.
        if (!D20Scopes.Has(user, D20Scopes.Write))
        {
            return TypedResults.Forbid(authenticationSchemes: [D20Jwt.Scheme]);
        }

        var entry = vault.Find(id);
        if (entry is null || (entry.Owner != user.Identity?.Name && !user.IsInRole("keeper")))
        {
            return TypedResults.NotFound();
        }

        entry.Published = true;

        return TypedResults.NoContent();
    }
}
