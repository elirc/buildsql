// d19_logging / ex8 - everything this set drills, on one endpoint.
// See lessons/d19_logging/README.md, "Exercise 8".

namespace DotnetDojo.Api.D19_Logging;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/picks/{id:int}/pack", Pack);
    }

    // Exactly one entry per request, written through ILogger<Ex8> so the
    // category is this class, every one carrying a TraceId property:
    //   unknown pick                  -> 404, Information, PickId
    //   any line with OnHand below
    //   Wanted                        -> 409 problem details, WARNING, Sku
    //   D19Packing.Pack throws        -> 500 problem details leaking nothing,
    //                                    ERROR with the exception itself
    //   otherwise                     -> 200 with a PackedPick, Information,
    //                                    PickId and Cartons
    private static IResult Pack(int id, ILogger<Ex8> logger, HttpContext http) =>
        throw new NotImplementedException(
            "ex8: POST /d19/picks/{id}/pack is not implemented yet - edit src/Api/D19_Logging/Ex8.cs");
}
