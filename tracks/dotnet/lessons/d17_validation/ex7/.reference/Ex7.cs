// d17_validation / ex7 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D17_Validation;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/vets/{code}/appointments", Post);
    }

    private static IResult Post(string code, AppointmentRequest body)
    {
        // The URL names a resource. If it does not exist, nothing about the
        // body can be judged yet.
        var vet = D17Clinic.Find(code);
        if (vet is null)
        {
            return TypedResults.NotFound();
        }

        var errors = new Dictionary<string, string[]>();

        if (!D17Clinic.Species.Contains(body.Species ?? ""))
        {
            errors["species"] = ["Not a species this clinic treats."];
        }

        if (body.StartHour < D17Clinic.OpensHour || body.StartHour > D17Clinic.ClosesHour - 1)
        {
            errors["startHour"] = ["The clinic opens at 08:00 and takes its last slot at 17:00."];
        }

        if (body.DurationMinutes < D17Clinic.MinMinutes || body.DurationMinutes > D17Clinic.MaxMinutes)
        {
            errors["durationMinutes"] = ["A visit lasts between 10 and 120 minutes."];
        }

        int start = body.StartHour * 60;
        if (errors.Count == 0 && start + body.DurationMinutes > D17Clinic.ClosesHour * 60)
        {
            errors[""] = ["That start and that length would run past 18:00."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        // Everything the client sent is well formed and internally consistent.
        // The refusal now comes from the world, not from the payload - so
        // there is no field to blame, and 422 is the honest status.
        if (!vet.Treats.Contains(body.Species!))
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status422UnprocessableEntity,
                title: "That vet does not treat that species.",
                detail: $"{vet.Name} treats {string.Join(" and ", vet.Treats)}, not {body.Species}.");
        }

        return TypedResults.Ok(new AppointmentAccepted(
            vet.Name, body.Species!, start, start + body.DurationMinutes));
    }
}
