// d19_logging / ex5 - what must never be in a log.
// See lessons/d19_logging/README.md, "Exercise 5".

namespace DotnetDojo.Api.D19_Logging;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/dispatch", Dispatch);
    }

    // 404 when the order or the courier code is unknown. Otherwise 200 with a
    // DispatchResult, and exactly one Information entry naming the properties
    // OrderRef and Courier - the courier's NAME. The courier token must not
    // appear anywhere in the log, in any form.
    private static IResult Dispatch(DispatchRequest body, ILogger<Ex5> logger)
    {
        var pick = D19Warehouse.ByOrder(body.OrderRef);
        var courier = D19Warehouse.Courier(body.CourierCode);
        if (pick is null || courier is null)
        {
            return TypedResults.NotFound();
        }

        // TODO ex5: logging the request object logs every field of it, and one
        // of those fields is a bearer token that now lives in the log store
        // forever, readable by everyone with log access.
        logger.LogInformation("Dispatching {@Request}", body);

        return TypedResults.Ok(new DispatchResult(pick.OrderRef, courier.Name));
    }
}
