// d20_auth_jwt / ex3 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d20/entries", Create).RequireAuthorization(D20Policies.Caller);
    }

    private static IResult Create(NewEntry body, ClaimsPrincipal user, D20Vault vault)
    {
        string title = body.Title?.Trim() ?? "";
        if (title.Length == 0)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["title"] = ["A title is required."],
            });
        }

        // body.Owner is never read. The owner is whoever the token says is
        // calling, and the property exists only to be ignored.
        var entry = vault.Add(user.Identity?.Name ?? "", title, body.Body?.Trim() ?? "");

        return TypedResults.Created(
            $"/d20/entries/{entry.Id}",
            new EntryDto(entry.Id, entry.Owner, entry.Title, entry.Body));
    }
}
