// d19_logging / ex7 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D19_Logging;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/shipments", Ship);
    }

    private static IResult Ship(ShipmentRequest body, ILogger<Ex7> logger, HttpContext http)
    {
        // Read once, put on every line. It is the only thing that joins an
        // error a user can see to a row you can find.
        string traceId = http.TraceIdentifier;

        var errors = new Dictionary<string, string[]>();

        string orderRef = body.OrderRef?.Trim() ?? "";
        if (orderRef.Length == 0)
        {
            errors["orderRef"] = ["An order reference is required."];
        }

        if (body.WeightKg < 1)
        {
            errors["weightKg"] = ["A parcel weighs at least 1 kg."];
        }

        if (errors.Count > 0)
        {
            logger.LogInformation(
                "Shipment request rejected for {OrderRef} ({TraceId})", orderRef, traceId);

            return TypedResults.ValidationProblem(errors, instance: http.Request.Path);
        }

        var pick = D19Warehouse.ByOrder(orderRef);
        if (pick is null)
        {
            logger.LogInformation("No pick for order {OrderRef} ({TraceId})", orderRef, traceId);
            return TypedResults.NotFound();
        }

        if (body.WeightKg > D19Warehouse.MaxParcelKg)
        {
            // The request was fine and the world is not: Warning, with the
            // number, so "how often does this happen" is answerable.
            logger.LogWarning(
                "Parcel for {OrderRef} is {WeightKg} kg, over the limit ({TraceId})",
                orderRef, body.WeightKg, traceId);

            return TypedResults.Conflict();
        }

        try
        {
            string reference = D19Dispatch.Book(orderRef, body.WeightKg);

            logger.LogInformation(
                "Shipment {Reference} booked for {OrderRef} ({TraceId})",
                reference, orderRef, traceId);

            return TypedResults.Created(
                $"/d19/shipments/{reference}",
                new ShipmentAccepted(reference, orderRef, body.WeightKg));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Booking failed for {OrderRef} ({TraceId})", orderRef, traceId);

            return TypedResults.Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "The carrier could not be reached.",
                detail: "The shipment was not booked.",
                instance: http.Request.Path);
        }
    }
}
