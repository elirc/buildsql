// d18_problemdetails / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/sailings/{code}/hold", Hold);
    }

    private static IResult Hold(string code, SeatRequest body, HttpContext http)
    {
        var sailing = D18Ferry.Find(code);
        if (sailing is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "No such sailing.",
                detail: $"This operator has no sailing '{code}'.",
                instance: http.Request.Path);
        }

        if (body.Seats < 1 || body.Seats > D18Ferry.MaxSeatsPerBooking)
        {
            // A validation problem is a ProblemDetails with one extra member.
            // The overload takes the same type and instance as the others,
            // which is what keeps every failure on this API one shape.
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]>
                {
                    ["seats"] = [$"Between 1 and {D18Ferry.MaxSeatsPerBooking} seats per booking."],
                },
                type: D18Ferry.ProblemBase + "invalid-request",
                instance: http.Request.Path);
        }

        return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
    }
}
