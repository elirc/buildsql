// d20_auth_jwt / ex8 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d20/entries/{id:int}", Replace).RequireAuthorization(D20Policies.Caller);
    }

    private static IResult Replace(int id, EntryUpdate body, ClaimsPrincipal user, D20Vault vault)
    {
        // Order: what the token permits, then what it may see, then what it
        // sent. Validating first would tell a caller with no rights which of
        // their fields were malformed.
        if (!D20Scopes.Has(user, D20Scopes.Write))
        {
            return TypedResults.Forbid(authenticationSchemes: [D20Jwt.Scheme]);
        }

        var entry = vault.Find(id);
        if (entry is null || (entry.Owner != user.Identity?.Name && !user.IsInRole("keeper")))
        {
            return TypedResults.NotFound();
        }

        string title = body.Title?.Trim() ?? "";
        if (title.Length == 0)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["title"] = ["A title is required."],
            });
        }

        entry.Title = title;
        entry.Body = body.Body?.Trim() ?? "";

        // body.Owner is not assigned, and never will be. Ownership is set once
        // from the token that created the row.
        return TypedResults.NoContent();
    }
}
