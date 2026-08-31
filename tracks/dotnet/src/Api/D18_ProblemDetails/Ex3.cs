// d18_problemdetails / ex3 - a validation problem is a problem.
// See lessons/d18_problemdetails/README.md, "Exercise 3".

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/sailings/{code}/hold", Hold);
    }

    // 400 when seats is outside 1..D18Ferry.MaxSeatsPerBooking, as a
    // VALIDATION problem: an errors dictionary keyed "seats", and also a type
    // of D18Ferry.ProblemBase + "invalid-request" and an instance. 404 problem
    // details for an unknown code. Otherwise 200 with the SailingDto.
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

        // TODO ex3: a bad seat count is answered with a plain string, which is
        // text/plain with no shape at all - the one failure in this file a
        // client is most likely to hit.
        if (body.Seats < 1 || body.Seats > D18Ferry.MaxSeatsPerBooking)
        {
            return TypedResults.BadRequest("bad seat count");
        }

        return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
    }
}
