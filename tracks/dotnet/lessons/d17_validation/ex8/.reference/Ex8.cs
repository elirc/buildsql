// d17_validation / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D17_Validation;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d17/bookings", Post);
    }

    private static IResult Post(BookingRequest body)
    {
        var errors = new Dictionary<string, string[]>();

        // The vet is a FIELD of the body here, not a segment of the URL, so an
        // unknown one is a 400 about that field - not a 404 about the booking.
        var vet = D17Clinic.Find(body.VetCode?.Trim());
        if (vet is null)
        {
            errors["vetCode"] = ["No such vet."];
        }

        string ownerName = "";
        if (body.Owner is null)
        {
            errors["owner"] = ["An owner is required."];
        }
        else
        {
            ownerName = body.Owner.Name?.Trim() ?? "";
            if (ownerName.Length == 0)
            {
                errors["owner.name"] = ["A name is required."];
            }
        }

        var visits = body.Visits ?? [];
        if (visits.Count == 0)
        {
            errors["visits"] = ["A booking needs at least one visit."];
        }
        else
        {
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            for (int i = 0; i < visits.Count; i++)
            {
                string petName = visits[i].PetName?.Trim() ?? "";
                if (petName.Length == 0 || petName.Length > 40)
                {
                    errors[$"visits[{i}].petName"] = ["A pet name of 1 to 40 characters is required."];
                }
                else if (!seen.Add(petName))
                {
                    errors[$"visits[{i}].petName"] = ["This pet is already in the booking."];
                }

                if (!D17Clinic.Species.Contains(visits[i].Species ?? ""))
                {
                    errors[$"visits[{i}].species"] = ["Not a species this clinic treats."];
                }

                if (visits[i].DurationMinutes < D17Clinic.MinMinutes
                    || visits[i].DurationMinutes > D17Clinic.MaxMinutes)
                {
                    errors[$"visits[{i}].durationMinutes"] = ["A visit lasts between 10 and 120 minutes."];
                }
            }
        }

        if (body.StartHour < D17Clinic.OpensHour || body.StartHour > D17Clinic.ClosesHour - 1)
        {
            errors["startHour"] = ["The clinic opens at 08:00 and takes its last slot at 17:00."];
        }

        int start = body.StartHour * 60;
        int total = visits.Sum(v => v.DurationMinutes);

        // Only once every part is individually sound does the whole have a
        // meaningful length to check.
        if (errors.Count == 0 && start + total > D17Clinic.ClosesHour * 60)
        {
            errors[""] = ["The round would run past 18:00."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        // Last, and only last: the rule the client could not have fixed by
        // rereading its own payload.
        var unsupported = visits
            .Select(v => v.Species!)
            .Distinct()
            .Where(s => !vet!.Treats.Contains(s))
            .ToList();
        if (unsupported.Count > 0)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status422UnprocessableEntity,
                title: "That vet does not treat one of those species.",
                detail: $"{vet!.Name} treats {string.Join(" and ", vet.Treats)}, not "
                    + string.Join(" or ", unsupported) + ".");
        }

        string reference = $"{vet!.Code}-{body.StartHour}";

        return TypedResults.Created($"/d17/bookings/{reference}", new BookingAccepted(
            reference,
            vet.Code,
            ownerName,
            visits.Select(v => v.PetName!.Trim()).ToList(),
            start,
            start + total));
    }
}
