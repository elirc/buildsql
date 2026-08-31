// d19_logging / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D19_Logging;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/dispatch", Dispatch);
    }

    private static IResult Dispatch(DispatchRequest body, ILogger<Ex5> logger)
    {
        var pick = D19Warehouse.ByOrder(body.OrderRef);
        var courier = D19Warehouse.Courier(body.CourierCode);
        if (pick is null || courier is null)
        {
            return TypedResults.NotFound();
        }

        // Name the two fields that are worth keeping. Logging the request
        // object would have logged the token with them, and a log store is
        // replicated, retained and read by far more people than a database.
        logger.LogInformation(
            "Dispatched {OrderRef} with {Courier}", pick.OrderRef, courier.Name);

        return TypedResults.Ok(new DispatchResult(pick.OrderRef, courier.Name));
    }
}
