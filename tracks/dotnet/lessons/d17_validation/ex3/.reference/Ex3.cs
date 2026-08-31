// d17_validation / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D17_Validation;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/slots", Post);
    }

    private static IResult Post(SlotRequest body)
    {
        var errors = new Dictionary<string, string[]>();

        if (body.StartHour < D17Clinic.OpensHour || body.StartHour > D17Clinic.ClosesHour - 1)
        {
            errors["startHour"] = ["The clinic opens at 08:00 and takes its last slot at 17:00."];
        }

        if (body.DurationMinutes < D17Clinic.MinMinutes || body.DurationMinutes > D17Clinic.MaxMinutes)
        {
            errors["durationMinutes"] = ["A visit lasts between 10 and 120 minutes."];
        }

        int start = body.StartHour * 60;

        // The cross-field rule runs only once both fields are individually
        // sound: an hour of 25 and a length of -3 have no meaningful sum, and
        // a third error about it would only be noise. The empty key is the
        // form-level one - it belongs to the request, not to a field.
        if (errors.Count == 0 && start + body.DurationMinutes > D17Clinic.ClosesHour * 60)
        {
            errors[""] = ["That start and that length would run past 18:00."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(new SlotAccepted(start, start + body.DurationMinutes));
    }
}
