// d20_auth_jwt / ex3 - the client does not get to choose the owner.
// See lessons/d20_auth_jwt/README.md, "Exercise 3".

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d20/entries", Create).RequireAuthorization(D20Policies.Caller);
    }

    // 400 as a validation problem, keyed "title", when the title is blank.
    // Otherwise 201 with Location /d20/entries/{newId} and the created
    // EntryDto - owned by whoever the TOKEN says is calling.
    //
    // NewEntry has an Owner property. It is a trap.
    private static IResult Create(NewEntry body, ClaimsPrincipal user, D20Vault vault) =>
        throw new NotImplementedException(
            "ex3: POST /d20/entries is not implemented yet - edit src/Api/D20_AuthJwt/Ex3.cs");
}
