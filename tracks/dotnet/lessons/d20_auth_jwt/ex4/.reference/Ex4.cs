// d20_auth_jwt / ex4 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d20/entries/{id:int}", One).RequireAuthorization(D20Policies.Caller);
    }

    private static IResult One(int id, ClaimsPrincipal user, D20Vault vault)
    {
        var entry = vault.Find(id);

        // "Does not exist" and "exists and is not yours" are answered by the
        // same expression, so they are answered identically. A 403 here would
        // let a caller map the whole id space from the outside.
        if (entry is null || (entry.Owner != user.Identity?.Name && !user.IsInRole("keeper")))
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(new EntryDto(entry.Id, entry.Owner, entry.Title, entry.Body));
    }
}
