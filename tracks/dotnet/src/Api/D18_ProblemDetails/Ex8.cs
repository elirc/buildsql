// d18_problemdetails / ex8 - the whole error contract on one endpoint.
// See lessons/d18_problemdetails/README.md, "Exercise 8".

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/orders", Create);
    }

    // 400 as a VALIDATION problem when sailingCode is blank ("sailingCode") or
    // seats is outside 1..6 ("seats") - both keys at once when both are wrong.
    // Then D18Booking.Reserve is called and its exceptions are translated
    // exactly as in ex5: 404, 409 with extensions, 402 with a reason, and 500
    // that leaks nothing. Success is 201 with Location /d18/orders/{reference}
    // and an OrderAccepted, where the reference is "{sailingCode}-{seats}".
    //
    // Every failure carries a type off D18Ferry.ProblemBase, an instance, and
    // a "traceId" extension - including the validation problem.
    private static IResult Create(OrderRequest body, HttpContext http) =>
        throw new NotImplementedException(
            "ex8: POST /d18/orders is not implemented yet - edit src/Api/D18_ProblemDetails/Ex8.cs");
}
