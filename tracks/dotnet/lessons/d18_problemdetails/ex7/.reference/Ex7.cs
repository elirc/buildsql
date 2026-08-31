// d18_problemdetails / ex7 - reference solution (author only, used by `dojo verify`).

using System.Text.Json;

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/sailings/{code}/purchase", Purchase);
    }

    private static async Task<IResult> Purchase(string code, HttpContext http)
    {
        // Reading the body by hand means owning the two failures the binder
        // would otherwise have owned: the wrong media type, and bytes that are
        // not JSON at all. Both are client errors, and neither is a 500.
        string? contentType = http.Request.ContentType;
        if (contentType is null
            || !contentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
        {
            return Fail(http, StatusCodes.Status415UnsupportedMediaType, "unsupported-media-type",
                "This endpoint reads JSON.",
                $"The request carried '{contentType ?? "no content type"}'.");
        }

        PurchaseRequest? body;
        try
        {
            body = await http.Request.ReadFromJsonAsync<PurchaseRequest>();
        }
        catch (JsonException)
        {
            body = null;
        }

        if (body is null)
        {
            return Fail(http, StatusCodes.Status400BadRequest, "malformed-body",
                "The body is not readable JSON.",
                "The bytes could not be parsed into a purchase request.");
        }

        if (body.Seats < 1 || body.Seats > D18Ferry.MaxSeatsPerBooking)
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]>
                {
                    ["seats"] = [$"Between 1 and {D18Ferry.MaxSeatsPerBooking} seats per booking."],
                },
                type: D18Ferry.ProblemBase + "invalid-request",
                instance: http.Request.Path);
        }

        try
        {
            var sailing = D18Booking.Reserve(code, body.Seats, body.Card);

            return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
        }
        catch (SailingNotFoundException missing)
        {
            return Fail(http, StatusCodes.Status404NotFound, "sailing-not-found",
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
            return Fail(http, StatusCodes.Status500InternalServerError, "internal",
                "Something went wrong at our end.", "The request could not be completed.");
        }
    }

    private static IResult Fail(HttpContext http, int status, string type, string title, string detail) =>
        TypedResults.Problem(
            statusCode: status,
            type: D18Ferry.ProblemBase + type,
            title: title,
            detail: detail,
            instance: http.Request.Path);
}
