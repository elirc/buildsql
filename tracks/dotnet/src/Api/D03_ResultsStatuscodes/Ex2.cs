// d03_results_statuscodes / ex2 - 201, and the header that makes it useful.
// See lessons/d03_results_statuscodes/README.md, "Exercise 2".

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d03/bookings", Create);
    }

    // 201 with a Location of /d03/bookings/{id} and the created booking in the
    // body. A blank room or a blank guest is a 400 and writes nothing.
    private static IResult Create(IDeskStore store, NewBooking request) =>
        throw new NotImplementedException(
            "ex2: POST /d03/bookings is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex2.cs");
}
