// d20_auth_jwt / ex4 - not yours, and you may not even know it exists.
// See lessons/d20_auth_jwt/README.md, "Exercise 4".

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d20/entries/{id:int}", One).RequireAuthorization(D20Policies.Caller);
    }

    // 200 with the EntryDto when the caller owns it, or is in the "keeper"
    // role. 404 when there is no such entry - and ALSO 404 when it belongs to
    // somebody else, because a caller who may not read it may not learn that
    // it exists either.
    private static IResult One(int id, ClaimsPrincipal user, D20Vault vault)
    {
        var entry = vault.Find(id);
        if (entry is null)
        {
            return TypedResults.NotFound();
        }

        // TODO ex4: nothing here looks at who is asking, so entry 3 is
        // readable by everyone with any valid token.
        return TypedResults.Ok(new EntryDto(entry.Id, entry.Owner, entry.Title, entry.Body));
    }
}
