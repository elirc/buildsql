// 09_auth_and_testing / challenge - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/l09/notes/{id:int}", Replace).RequireAuthorization();
    }

    private static IResult Replace(
        int id, UpdateNote request, ClaimsPrincipal user, INoteStore store)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["text"] = ["Text is required."] });
        }

        var note = store.Find(id);
        if (note is null)
        {
            return TypedResults.NotFound();
        }

        string caller = user.Identity?.Name ?? "";
        bool allowed = note.Owner == caller || user.IsInRole("admin");
        if (!allowed)
        {
            // Not 403: telling this caller the note exists is itself a leak.
            return TypedResults.NotFound();
        }

        store.Replace(id, request.Text);
        return TypedResults.NoContent();
    }
}
