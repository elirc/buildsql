// d20_auth_jwt / ex2 - 401 says who, 403 says what.
// See lessons/d20_auth_jwt/README.md, "Exercise 2".

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex2: this lets any caller with a valid token read the whole
        // vault. Only a keeper may - and the difference between "I do not
        // know who you are" and "I know, and no" is two different statuses.
        app.MapGet("/d20/vault", All).RequireAuthorization(D20Policies.Caller);
    }

    // Given: every entry, id ascending.
    private static IResult All(D20Vault vault) =>
        TypedResults.Ok(vault.All
            .OrderBy(e => e.Id)
            .Select(e => new EntryDto(e.Id, e.Owner, e.Title, e.Body))
            .ToList());
}
