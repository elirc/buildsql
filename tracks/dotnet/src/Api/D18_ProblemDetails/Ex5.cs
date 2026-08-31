// d18_problemdetails / ex5 - one domain error, one status, one type.
// See lessons/d18_problemdetails/README.md, "Exercise 5".

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/sailings/{code}/reserve", Reserve);
    }

    // Calls D18Booking.Reserve, which throws, and translates:
    //   SailingNotFoundException  -> 404, type "sailing-not-found"
    //   SailingFullException      -> 409, type "sailing-full",
    //                                extensions sailingCode and seatsLeft
    //   PaymentDeclinedException  -> 402, type "payment-declined",
    //                                extension reason
    //   anything else             -> 500, type "internal", leaking nothing
    // Success is 200 with the SailingDto.
    private static IResult Reserve(string code, PurchaseRequest body, HttpContext http) =>
        throw new NotImplementedException(
            "ex5: POST /d18/sailings/{code}/reserve is not implemented yet - edit src/Api/D18_ProblemDetails/Ex5.cs");
}
