// 09_auth_and_testing / ex4 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l09/notes", CreateNote).RequireAuthorization();
    }

    private static IResult CreateNote(NewNote request, ClaimsPrincipal user, INoteStore store)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["text"] = ["Text is required."] });
        }

        // request.Owner is deliberately ignored: the token is the only source of
        // truth about who is calling.
        string owner = user.Identity?.Name ?? "";
        var note = store.Add(owner, request.Text);

        return TypedResults.Created($"/l09/notes/{note.Id}", note);
    }
}
