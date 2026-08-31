// d20_auth_jwt / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.AspNetCore.Authentication;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d20/entries/{id:int}/preview", Preview);
    }

    private static async Task<IResult> Preview(int id, D20Vault vault, HttpContext http)
    {
        var entry = vault.Find(id);
        if (entry is null)
        {
            return TypedResults.NotFound();
        }

        // The endpoint is anonymous, so nothing has authenticated this request
        // and the ambient ClaimsPrincipal is empty. Ask the scheme directly -
        // and check Succeeded, because a forged or expired token must unlock
        // nothing rather than throwing or being believed.
        var result = await http.AuthenticateAsync(D20Jwt.Scheme);

        bool mayRead = result.Succeeded
            && result.Principal is not null
            && (entry.Owner == result.Principal.Identity?.Name
                || result.Principal.IsInRole("keeper"));

        return TypedResults.Ok(new PreviewDto(entry.Title, mayRead ? entry.Body : null));
    }
}
