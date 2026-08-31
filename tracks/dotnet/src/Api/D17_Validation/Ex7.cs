// d17_validation / ex7 - malformed, or merely impossible.
// See lessons/d17_validation/README.md, "Exercise 7".

namespace DotnetDojo.Api.D17_Validation;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/vets/{code}/appointments", Post);
    }

    // 404 when {code} names no vet. 400, as a validation problem, when the
    // request itself is wrong: an unknown species ("species"), a startHour
    // outside 8..17 ("startHour"), a duration outside 10..120
    // ("durationMinutes"), or a slot ending after 18:00 ("").
    // 422, as a ProblemDetails, when the request is perfectly well formed and
    // still cannot be satisfied: this vet does not treat that species.
    // Otherwise 200 with an AppointmentAccepted.
    private static IResult Post(string code, AppointmentRequest body) =>
        throw new NotImplementedException(
            "ex7: POST /d17/vets/{code}/appointments is not implemented yet - edit src/Api/D17_Validation/Ex7.cs");
}
