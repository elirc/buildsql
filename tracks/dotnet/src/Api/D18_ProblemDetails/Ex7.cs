// d18_problemdetails / ex7 - one contract, every failure.
// See lessons/d18_problemdetails/README.md, "Exercise 7".

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/sailings/{code}/purchase", Purchase);
    }

    // The body is read by hand, so the content type is this handler's problem
    // too. In order:
    //   not application/json      -> 415, type "unsupported-media-type"
    //   unreadable JSON           -> 400, type "malformed-body"
    //   seats outside 1..6        -> 400 validation problem keyed "seats"
    //   unknown code              -> 404, type "sailing-not-found"
    //   not enough seats          -> 409, type "sailing-full"
    //   card "0000"               -> 402, type "payment-declined"
    //   otherwise                 -> 200 with the SailingDto
    // Every failure is problem details with a type, a status and an instance.
    private static Task<IResult> Purchase(string code, HttpContext http) =>
        throw new NotImplementedException(
            "ex7: POST /d18/sailings/{code}/purchase is not implemented yet - edit src/Api/D18_ProblemDetails/Ex7.cs");
}
