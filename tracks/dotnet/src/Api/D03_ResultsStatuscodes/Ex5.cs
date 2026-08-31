// d03_results_statuscodes / ex5 - 400 for malformed, 422 for impossible.
// See lessons/d03_results_statuscodes/README.md, "Exercise 5".

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d03/bookings/quote", Quote);
    }

    // 200 with {"room": …, "nights": …, "totalCents": …}, where the total is
    // capacity * Desk.NightlyRatePerHead * nights.
    //
    // A blank room or a nights below 1 is a 400 validation problem keyed
    // "room" / "nights". A well-formed request naming a room the desk does not
    // have is a 422.
    private static IResult Quote(IDeskStore store, QuoteRequest request) =>
        throw new NotImplementedException(
            "ex5: POST /d03/bookings/quote is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex5.cs");
}
