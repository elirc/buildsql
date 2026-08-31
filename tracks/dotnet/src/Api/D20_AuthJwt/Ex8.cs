// d20_auth_jwt / ex8 - every rule in this set, on one write.
// See lessons/d20_auth_jwt/README.md, "Exercise 8".

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d20/entries/{id:int}", Replace).RequireAuthorization(D20Policies.Caller);
    }

    // In this order:
    //   no valid token                       -> 401 (the policy does this)
    //   no D20Scopes.Write in the scope claim -> 403
    //   no such entry, or somebody else's and
    //   the caller is not a keeper            -> 404
    //   blank title                           -> 400 validation problem
    //                                            keyed "title"
    //   otherwise                             -> 204, title and body written,
    //                                            OWNER UNCHANGED whatever the
    //                                            body says
    private static IResult Replace(int id, EntryUpdate body, ClaimsPrincipal user, D20Vault vault) =>
        throw new NotImplementedException(
            "ex8: PUT /d20/entries/{id} is not implemented yet - edit src/Api/D20_AuthJwt/Ex8.cs");
}
