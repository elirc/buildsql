// i2_interview_drills / challenge - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var notes = app.MapGroup("/i2/challenge/notes")
            .RequireAuthorization(policy => policy
                .AddAuthenticationSchemes(I2Jwt.Scheme)
                .RequireAuthenticatedUser());

        notes.MapGet("", ListNotes);
        notes.MapPost("", CreateNote);
    }

    private static IResult ListNotes(
        int? page, int? size, ClaimsPrincipal user, IDrillNoteStore store, HttpResponse response)
    {
        int wanted = page ?? 1;
        int perPage = size ?? 2;

        var errors = new Dictionary<string, string[]>();

        if (wanted < 1)
        {
            errors["page"] = ["page is 1-based."];
        }

        if (perPage < 1 || perPage > 10)
        {
            errors["size"] = ["size must be between 1 and 10."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        string owner = user.Identity?.Name ?? "";
        var mine = store.All()
            .Where(n => n.Owner == owner)
            .OrderBy(n => n.Id)
            .ToList();

        response.Headers["X-Total-Count"] = mine.Count.ToString();

        return TypedResults.Ok(mine.Skip((wanted - 1) * perPage).Take(perPage).ToList());
    }

    private static IResult CreateNote(
        NewDrillNote request, ClaimsPrincipal user, IDrillNoteStore store)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["text"] = ["Text is required."] });
        }

        string owner = user.Identity?.Name ?? "";
        var note = store.Add(owner, request.Text);

        return TypedResults.Created($"/i2/challenge/notes/{note.Id}", note);
    }
}
