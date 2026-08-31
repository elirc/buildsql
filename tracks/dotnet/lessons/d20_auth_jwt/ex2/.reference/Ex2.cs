// d20_auth_jwt / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // The policy answers both cases on its own: no valid token is a 401,
        // and a valid token without the role is a 403. Neither needs a line of
        // code in the handler.
        app.MapGet("/d20/vault", All).RequireAuthorization(D20Policies.Keeper);
    }

    private static IResult All(D20Vault vault) =>
        TypedResults.Ok(vault.All
            .OrderBy(e => e.Id)
            .Select(e => new EntryDto(e.Id, e.Owner, e.Title, e.Body))
            .ToList());
}
