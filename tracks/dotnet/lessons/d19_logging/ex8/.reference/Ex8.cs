// d19_logging / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D19_Logging;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/picks/{id:int}/pack", Pack);
    }

    private static IResult Pack(int id, ILogger<Ex8> logger, HttpContext http)
    {
        string traceId = http.TraceIdentifier;

        var pick = D19Warehouse.Find(id);
        if (pick is null)
        {
            logger.LogInformation("Pack against unknown pick {PickId} ({TraceId})", id, traceId);
            return TypedResults.NotFound();
        }

        var missing = pick.Lines.FirstOrDefault(l => l.OnHand < l.Wanted);
        if (missing is not null)
        {
            logger.LogWarning(
                "Pick {PickId} is short on {Sku} ({TraceId})", pick.Id, missing.Sku, traceId);

            return TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "The pick cannot be packed.",
                detail: $"There is not enough {missing.Sku} on the shelf.",
                instance: http.Request.Path);
        }

        try
        {
            int cartons = D19Packing.Pack(pick);

            logger.LogInformation(
                "Pick {PickId} packed into {Cartons} carton(s) ({TraceId})",
                pick.Id, cartons, traceId);

            return TypedResults.Ok(new PackedPick(pick.Id, cartons));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Packing failed for pick {PickId} ({TraceId})", pick.Id, traceId);

            return TypedResults.Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "The pick could not be packed.",
                detail: "The packing line reported a fault.",
                instance: http.Request.Path);
        }
    }
}
