// d18_problemdetails / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d18/sailings/{code}/traced", Traced);
    }

    private static IResult Traced(string code, HttpContext http)
    {
        // One value, read once, used twice: the header goes on every response
        // so a proxy log can correlate, and the body carries it so a human
        // looking at an error screen can read it out.
        string traceId = http.TraceIdentifier;
        http.Response.Headers["X-Trace-Id"] = traceId;

        var sailing = D18Ferry.Find(code);
        if (sailing is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                type: D18Ferry.ProblemBase + "sailing-not-found",
                title: "No such sailing.",
                detail: $"This operator has no sailing '{code}'.",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?> { ["traceId"] = traceId });
        }

        return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
    }
}
