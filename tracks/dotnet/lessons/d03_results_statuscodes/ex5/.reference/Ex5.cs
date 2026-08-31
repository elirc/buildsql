// d03_results_statuscodes / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d03/bookings/quote", Quote);
    }

    private static IResult Quote(IDeskStore store, QuoteRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Room))
        {
            errors["room"] = ["room is required."];
        }

        if (request.Nights < 1)
        {
            errors["nights"] = ["nights must be at least 1."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        var room = store.FindRoom(request.Room!);

        if (room is null)
        {
            return TypedResults.UnprocessableEntity($"The desk has no room called '{request.Room}'.");
        }

        int total = room.Capacity * Desk.NightlyRatePerHead * request.Nights;

        return TypedResults.Ok(new QuoteResponse(room.Name, request.Nights, total));
    }
}
