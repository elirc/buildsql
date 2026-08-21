// i2_interview_drills / challenge - the 45-minute take-home, in one file.
// See lessons/i2_interview_drills/README.md, "Challenge".

using System.Security.Claims;

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO challenge: both of these must require an authenticated caller on
        // I2Jwt.Scheme. A route group is the tidy way to say that once.
        app.MapGet("/i2/challenge/notes", ListNotes);
        app.MapPost("/i2/challenge/notes", CreateNote);
    }

    // 200 with one page of the CALLER'S OWN notes, id ascending, plus an
    // X-Total-Count header holding how many they have in total.
    // page is 1-based and defaults to 1; size defaults to 2 and may not exceed
    // 10. Anything else is a 400 validation problem keyed by the parameter.
    private static IResult ListNotes(
        int? page, int? size, ClaimsPrincipal user, IDrillNoteStore store, HttpResponse response) =>
        throw new NotImplementedException("challenge: GET /i2/challenge/notes is not implemented yet - edit src/Api/I2_InterviewDrills/Challenge.cs");

    // 400 validation problem keyed "text" when the text is blank; otherwise 201
    // with a Location of /i2/challenge/notes/{id} and the created note, owned by
    // the caller.
    private static IResult CreateNote(
        NewDrillNote request, ClaimsPrincipal user, IDrillNoteStore store) =>
        throw new NotImplementedException("challenge: POST /i2/challenge/notes is not implemented yet - edit src/Api/I2_InterviewDrills/Challenge.cs");
}
