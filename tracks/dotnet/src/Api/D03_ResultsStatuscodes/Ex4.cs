// d03_results_statuscodes / ex4 - four codes, one endpoint.
// See lessons/d03_results_statuscodes/README.md, "Exercise 4".

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d03/bookings/{id:int}/state", SetState);
    }

    // 204 on success; 404 when there is no such booking; 400 when the state is
    // not one of Desk.States; 409 when the booking is already cancelled.
    private static IResult SetState(IDeskStore store, int id, StateChange request) =>
        throw new NotImplementedException(
            "ex4: PUT /d03/bookings/{id:int}/state is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex4.cs");
}
