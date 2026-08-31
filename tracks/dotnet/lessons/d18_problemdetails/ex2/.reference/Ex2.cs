// d18_problemdetails / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/sailings/{code}/book", Book);
    }

    private static IResult Book(string code, SeatRequest body, HttpContext http)
    {
        var sailing = D18Ferry.Find(code);
        if (sailing is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                type: D18Ferry.ProblemBase + "sailing-not-found",
                title: "No such sailing.",
                detail: $"This operator has no sailing '{code}'.",
                instance: http.Request.Path);
        }

        if (sailing.Left < body.Seats)
        {
            // The type is the stable identity a client branches on; the
            // extensions are the numbers it needs to do something useful with
            // the refusal, without parsing the English in `detail`.
            return TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                type: D18Ferry.ProblemBase + "sailing-full",
                title: "That sailing cannot take that many.",
                detail: $"Sailing '{sailing.Code}' has {sailing.Left} seat(s) left "
                    + $"and {body.Seats} were asked for.",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?>
                {
                    ["sailingCode"] = sailing.Code,
                    ["seatsLeft"] = sailing.Left,
                });
        }

        return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
    }
}
