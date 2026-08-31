// d20_auth_jwt / ex7 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d20/reports", Reports).RequireAuthorization(D20Policies.Caller);
    }

    private static IResult Reports(ClaimsPrincipal user, D20Vault vault, HttpContext http)
    {
        if (!D20Scopes.Has(user, D20Scopes.Read))
        {
            return TypedResults.Forbid(authenticationSchemes: [D20Jwt.Scheme]);
        }

        bool keeper = user.IsInRole("keeper");
        http.Response.Headers["X-Result-Scope"] = keeper ? "all" : "own";

        // The identity is part of the QUERY, not a check applied to rows that
        // have already been loaded. That is the difference between an endpoint
        // that cannot leak and one that only happens not to.
        var visible = vault.All
            .Where(e => keeper || e.Owner == user.Identity!.Name)
            .OrderBy(e => e.Id)
            .Select(e => new EntryDto(e.Id, e.Owner, e.Title, e.Body))
            .ToList();

        return TypedResults.Ok(visible);
    }
}
