// d17_validation / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D17_Validation;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/visits", Post);
    }

    private static IResult Post(VisitRequest body)
    {
        // One dictionary, three independent checks, one decision at the end.
        // Nothing returns early, so a client with three problems hears about
        // three problems.
        var errors = new Dictionary<string, string[]>();

        string petName = body.PetName?.Trim() ?? "";
        if (petName.Length == 0 || petName.Length > 40)
        {
            errors["petName"] = ["A pet name of 1 to 40 characters is required."];
        }

        if (!D17Clinic.Species.Contains(body.Species ?? ""))
        {
            errors["species"] = ["Not a species this clinic treats: " + string.Join(", ", D17Clinic.Species) + "."];
        }

        if (body.DurationMinutes < D17Clinic.MinMinutes || body.DurationMinutes > D17Clinic.MaxMinutes)
        {
            errors["durationMinutes"] = ["A visit lasts between 10 and 120 minutes."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(new VisitAccepted(petName, body.Species!, body.DurationMinutes));
    }
}
