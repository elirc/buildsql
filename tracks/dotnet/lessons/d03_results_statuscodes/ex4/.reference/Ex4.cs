// d03_results_statuscodes / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d03/bookings/{id:int}/state", SetState);
    }

    private static IResult SetState(IDeskStore store, int id, StateChange request)
    {
        string state = request.State ?? "";

        if (!Desk.States.Contains(state))
        {
            return TypedResults.BadRequest($"'{state}' is not a booking state.");
        }

        var booking = store.Find(id);

        if (booking is null)
        {
            return TypedResults.NotFound();
        }

        if (booking.State == "cancelled")
        {
            return TypedResults.Conflict("A cancelled booking cannot change state.");
        }

        store.SetState(id, state);

        return TypedResults.NoContent();
    }
}
