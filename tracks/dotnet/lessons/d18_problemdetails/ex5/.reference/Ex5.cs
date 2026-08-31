// d18_problemdetails / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/sailings/{code}/reserve", Reserve);
    }

    private static IResult Reserve(string code, PurchaseRequest body, HttpContext http)
    {
        try
        {
            var sailing = D18Booking.Reserve(code, body.Seats, body.Card);

            return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
        }
        catch (SailingNotFoundException missing)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                type: D18Ferry.ProblemBase + "sailing-not-found",
                title: "No such sailing.",
                detail: $"This operator has no sailing '{missing.Code}'.",
                instance: http.Request.Path);
        }
        catch (SailingFullException full)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                type: D18Ferry.ProblemBase + "sailing-full",
                title: "That sailing cannot take that many.",
                detail: $"Sailing '{full.Code}' has {full.Left} seat(s) left.",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?>
                {
                    ["sailingCode"] = full.Code,
                    ["seatsLeft"] = full.Left,
                });
        }
        catch (PaymentDeclinedException declined)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status402PaymentRequired,
                type: D18Ferry.ProblemBase + "payment-declined",
                title: "The card was declined.",
                detail: "The payment provider refused this card.",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?> { ["reason"] = declined.Reason });
        }
        catch (Exception)
        {
            // The catch-all is last, and deliberately says nothing. Everything
            // known about this exception belongs in the log, not in the body.
            return TypedResults.Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                type: D18Ferry.ProblemBase + "internal",
                title: "Something went wrong at our end.",
                detail: "The request could not be completed.",
                instance: http.Request.Path);
        }
    }
}
