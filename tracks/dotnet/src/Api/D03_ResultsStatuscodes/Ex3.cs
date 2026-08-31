// d03_results_statuscodes / ex3 - 204 means there is nothing to say.
// See lessons/d03_results_statuscodes/README.md, "Exercise 3".

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/d03/bookings/{id:int}", Cancel);
    }

    // 204 with an empty body when the booking was there, 404 when it was not.
    private static IResult Cancel(IDeskStore store, int id) =>
        throw new NotImplementedException(
            "ex3: DELETE /d03/bookings/{id:int} is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex3.cs");
}
