// d17_validation / ex3 - the rule that belongs to no single field.
// See lessons/d17_validation/README.md, "Exercise 3".

namespace DotnetDojo.Api.D17_Validation;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/slots", Post);
    }

    // Per field: startHour must be 8..17 ("startHour"), durationMinutes must
    // be 10..120 ("durationMinutes"). Only when BOTH are valid, one more rule:
    // the slot must end by 18:00, filed under the form-level key "".
    // 200 with a SlotAccepted otherwise.
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

        // TODO ex3: the two fields can both be legal and still not fit
        // together - 17:00 plus ninety minutes runs an hour past closing. That
        // rule belongs to neither field, so it needs the form-level key.
        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        int start = body.StartHour * 60;

        return TypedResults.Ok(new SlotAccepted(start, start + body.DurationMinutes));
    }
}
