// d03_results_statuscodes / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d03/bookings", Create);
    }

    private static IResult Create(IDeskStore store, NewBooking request)
    {
        if (string.IsNullOrWhiteSpace(request.Room) || string.IsNullOrWhiteSpace(request.Guest))
        {
            return TypedResults.BadRequest("room and guest are both required.");
        }

        var booking = store.Add(request.Room, request.Guest);

        return TypedResults.Created($"/d03/bookings/{booking.Id}", booking);
    }
}
