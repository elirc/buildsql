// d18_problemdetails / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/orders", Create);
    }

    private static IResult Create(OrderRequest body, HttpContext http)
    {
        string traceId = http.TraceIdentifier;

        // Validation first: these are things the client can see in its own
        // payload, and none of them need the domain to be consulted.
        var errors = new Dictionary<string, string[]>();

        string code = body.SailingCode?.Trim() ?? "";
        if (code.Length == 0)
        {
            errors["sailingCode"] = ["A sailing code is required."];
        }

        if (body.Seats < 1 || body.Seats > D18Ferry.MaxSeatsPerBooking)
        {
            errors["seats"] = [$"Between 1 and {D18Ferry.MaxSeatsPerBooking} seats per booking."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(
                errors,
                type: D18Ferry.ProblemBase + "invalid-request",
                instance: http.Request.Path,
                extensions: new Dictionary<string, object?> { ["traceId"] = traceId });
        }

        try
        {
            D18Booking.Reserve(code, body.Seats, body.Card);

            string reference = $"{code}-{body.Seats}";

            return TypedResults.Created(
                $"/d18/orders/{reference}",
                new OrderAccepted(reference, code, body.Seats));
        }
        catch (SailingNotFoundException missing)
        {
            return Fail(http, traceId, StatusCodes.Status404NotFound, "sailing-not-found",
                "No such sailing.", $"This operator has no sailing '{missing.Code}'.");
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
                    ["traceId"] = traceId,
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
                extensions: new Dictionary<string, object?>
                {
                    ["reason"] = declined.Reason,
                    ["traceId"] = traceId,
                });
        }
        catch (Exception)
        {
            return Fail(http, traceId, StatusCodes.Status500InternalServerError, "internal",
                "Something went wrong at our end.", "The request could not be completed.");
        }
    }

    private static IResult Fail(
        HttpContext http, string traceId, int status, string type, string title, string detail) =>
        TypedResults.Problem(
            statusCode: status,
            type: D18Ferry.ProblemBase + type,
            title: title,
            detail: detail,
            instance: http.Request.Path,
            extensions: new Dictionary<string, object?> { ["traceId"] = traceId });
}
