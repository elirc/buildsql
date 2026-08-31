// d03_results_statuscodes / ex1 - empty is not missing.
// See lessons/d03_results_statuscodes/README.md, "Exercise 1".

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d03/bookings", List);
        app.MapGet("/d03/bookings/{id:int}", GetBooking);
    }

    // 200 with the bookings, id ascending. An optional state filters them, and
    // a filter that matches nothing is still a 200.
    private static IResult List(IDeskStore store, string? state) =>
        throw new NotImplementedException(
            "ex1: GET /d03/bookings is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex1.cs");

    // 200 with the booking, 404 when there is none with that id.
    private static IResult GetBooking(IDeskStore store, int id) =>
        throw new NotImplementedException(
            "ex1: GET /d03/bookings/{id:int} is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex1.cs");
}
