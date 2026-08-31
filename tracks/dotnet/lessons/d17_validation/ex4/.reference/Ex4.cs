// d17_validation / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D17_Validation;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/rounds", Post);
    }

    private static IResult Post(RoundRequest body)
    {
        var visits = body.Visits ?? [];
        if (visits.Count == 0)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["visits"] = ["A round needs at least one visit."],
            });
        }

        var errors = new Dictionary<string, string[]>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        for (int i = 0; i < visits.Count; i++)
        {
            var visit = visits[i];

            string petName = visit.PetName?.Trim() ?? "";
            if (petName.Length == 0 || petName.Length > 40)
            {
                errors[$"visits[{i}].petName"] = ["A pet name of 1 to 40 characters is required."];
            }
            else if (!seen.Add(petName))
            {
                // The FIRST mention was legitimate; this one is the mistake.
                errors[$"visits[{i}].petName"] = ["This pet is already in the round."];
            }

            if (!D17Clinic.Species.Contains(visit.Species ?? ""))
            {
                errors[$"visits[{i}].species"] = ["Not a species this clinic treats."];
            }

            if (visit.DurationMinutes < D17Clinic.MinMinutes || visit.DurationMinutes > D17Clinic.MaxMinutes)
            {
                errors[$"visits[{i}].durationMinutes"] = ["A visit lasts between 10 and 120 minutes."];
            }
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(new RoundAccepted(visits.Count, visits.Sum(v => v.DurationMinutes)));
    }
}
