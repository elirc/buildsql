// d03_results_statuscodes / ex6 - the same data, two content types.
// See lessons/d03_results_statuscodes/README.md, "Exercise 6".

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d03/bookings/{id:int}/receipt", GetReceipt);
    }

    // format defaults to "json" and may also be "text"; anything else is a 400.
    //
    //   json -> 200 application/json  {"bookingId": …, "guest": …, "room": …}
    //   text -> 200 text/plain        Booking 1: Ada in Sakura
    //
    // A booking that does not exist is a 404, whichever format was asked for.
    private static IResult GetReceipt(IDeskStore store, int id, string? format) =>
        throw new NotImplementedException(
            "ex6: GET /d03/bookings/{id:int}/receipt is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex6.cs");
}
