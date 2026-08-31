// d17_validation / ex8 - the whole desk, in one request.
// See lessons/d17_validation/README.md, "Exercise 8".

namespace DotnetDojo.Api.D17_Validation;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/bookings", Post);
    }

    // Every layer of this set at once, and all of it reported in one answer.
    //
    // 400, as a validation problem, for: a blank or unknown vetCode
    // ("vetCode"); a missing owner ("owner") or a blank owner name
    // ("owner.name"); a missing or empty visit list ("visits"); any visit
    // failing ex1's rules ("visits[i].petName", "visits[i].species",
    // "visits[i].durationMinutes"); a repeated pet name
    // ("visits[j].petName"); a startHour outside 8..17 ("startHour"); and,
    // only when the vet and the visits and the start hour are all
    // individually valid, a round that would run past 18:00 ("").
    //
    // 422, as a ProblemDetails, when everything above passes and the chosen
    // vet does not treat one of the species asked for.
    //
    // Otherwise 201 with Location /d17/bookings/{reference} and a
    // BookingAccepted, where reference is "{vetCode}-{startHour}" - for
    // example "cy-9".
    private static IResult Post(BookingRequest body) =>
        throw new NotImplementedException(
            "ex8: POST /d17/bookings is not implemented yet - edit src/Api/D17_Validation/Ex8.cs");
}
