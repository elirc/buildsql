// 09_auth_and_testing / ex3 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l09/notes", ListNotes).RequireAuthorization();
    }

    private static IResult ListNotes(ClaimsPrincipal user, INoteStore store)
    {
        string owner = user.Identity?.Name ?? "";

        var mine = store.All()
            .Where(n => n.Owner == owner)
            .OrderBy(n => n.Id)
            .ToList();

        return TypedResults.Ok(mine);
    }
}
