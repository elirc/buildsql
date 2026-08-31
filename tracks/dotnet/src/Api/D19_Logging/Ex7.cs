// d19_logging / ex7 - one line, right level, findable afterwards.
// See lessons/d19_logging/README.md, "Exercise 7".

namespace DotnetDojo.Api.D19_Logging;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/shipments", Ship);
    }

    // Exactly one entry per request, every one of them carrying a TraceId
    // property equal to HttpContext.TraceIdentifier:
    //   blank orderRef or weightKg below 1 -> 400 validation problem,
    //                                         keys "orderRef"/"weightKg",
    //                                         logged at Information
    //   no pick with that order reference  -> 404, Information, OrderRef
    //   weightKg over D19Warehouse.MaxParcelKg
    //                                      -> 409, WARNING, WeightKg
    //   D19Dispatch.Book throws            -> 500 problem details leaking
    //                                         nothing, ERROR with the
    //                                         exception in its own parameter
    //   otherwise                          -> 201 + Location, Information
    private static IResult Ship(ShipmentRequest body, ILogger<Ex7> logger, HttpContext http) =>
        throw new NotImplementedException(
            "ex7: POST /d19/shipments is not implemented yet - edit src/Api/D19_Logging/Ex7.cs");
}
