// d17_validation / ex1 - every problem, in one answer.
// See lessons/d17_validation/README.md, "Exercise 1".

namespace DotnetDojo.Api.D17_Validation;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/visits", Post);
    }

    // 400 as a validation problem when the pet name is blank or longer than 40
    // characters ("petName"), the species is not in D17Clinic.Species
    // ("species"), or the duration is outside 10..120 ("durationMinutes") -
    // with EVERY offending key present. Otherwise 200 with a VisitAccepted.
    private static IResult Post(VisitRequest body)
    {
        // TODO ex1: this returns on the first thing it finds, so a client with
        // three problems learns about one of them per round trip.
        if (string.IsNullOrWhiteSpace(body.PetName) || body.PetName.Length > 40)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["petName"] = ["A pet name of 1 to 40 characters is required."],
            });
        }

        if (!D17Clinic.Species.Contains(body.Species ?? ""))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["species"] = ["Not a species this clinic treats."],
            });
        }

        if (body.DurationMinutes < D17Clinic.MinMinutes || body.DurationMinutes > D17Clinic.MaxMinutes)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["durationMinutes"] = ["A visit lasts between 10 and 120 minutes."],
            });
        }

        return TypedResults.Ok(new VisitAccepted(body.PetName, body.Species!, body.DurationMinutes));
    }
}
