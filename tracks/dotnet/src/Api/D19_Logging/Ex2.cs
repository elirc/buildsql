// d19_logging / ex2 - the level is a claim about whose problem it is.
// See lessons/d19_logging/README.md, "Exercise 2".

namespace DotnetDojo.Api.D19_Logging;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/picks/{id:int}/scan", Scan);
    }

    // Exactly one entry per request, at the level the outcome deserves:
    //   unknown pick              -> 404, Information, property PickId
    //   sku not on this pick      -> 409, Information, property Sku
    //   sku on the pick, none in
    //   stock (OnHand is 0)       -> 409, WARNING, property Sku
    //   otherwise                 -> 200 with a ScanResult, Information
    // Nothing in this endpoint is ever logged at Error.
    private static IResult Scan(int id, ScanRequest body, ILogger<Ex2> logger) =>
        throw new NotImplementedException(
            "ex2: POST /d19/picks/{id}/scan is not implemented yet - edit src/Api/D19_Logging/Ex2.cs");
}
