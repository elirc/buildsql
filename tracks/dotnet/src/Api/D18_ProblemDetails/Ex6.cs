// d18_problemdetails / ex6 - the number the caller reads out on the phone.
// See lessons/d18_problemdetails/README.md, "Exercise 6".

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d18/sailings/{code}/traced", Traced);
    }

    // Every response - success or failure - carries the header "X-Trace-Id"
    // with this request's HttpContext.TraceIdentifier, and every problem
    // details body carries the same value as an extension member "traceId".
    // 404 problem details for an unknown code, 200 with the SailingDto
    // otherwise.
    private static IResult Traced(string code, HttpContext http)
    {
        // TODO ex6: no trace id goes out anywhere, so a user reporting "it
        // said something went wrong" gives you nothing to grep for.
        var sailing = D18Ferry.Find(code);
        if (sailing is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "No such sailing.",
                detail: $"This operator has no sailing '{code}'.",
                instance: http.Request.Path);
        }

        return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
    }
}
