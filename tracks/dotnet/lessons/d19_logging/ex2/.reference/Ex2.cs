// d19_logging / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D19_Logging;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/picks/{id:int}/scan", Scan);
    }

    private static IResult Scan(int id, ScanRequest body, ILogger<Ex2> logger)
    {
        var pick = D19Warehouse.Find(id);
        if (pick is null)
        {
            // Somebody else's typo. Information, and nothing louder.
            logger.LogInformation("Scan against unknown pick {PickId}", id);
            return TypedResults.NotFound();
        }

        var line = pick.Lines.FirstOrDefault(l => l.Sku == body.Sku);
        if (line is null)
        {
            logger.LogInformation("Sku {Sku} is not on pick {PickId}", body.Sku, id);
            return TypedResults.Conflict();
        }

        if (line.OnHand == 0)
        {
            // Same status code, different meaning: the shelf disagrees with
            // the system, and somebody in the warehouse wants to know.
            logger.LogWarning("Sku {Sku} on pick {PickId} has nothing on hand", line.Sku, id);
            return TypedResults.Conflict();
        }

        logger.LogInformation("Scanned {Sku} on pick {PickId}", line.Sku, id);

        return TypedResults.Ok(new ScanResult(line.Sku, line.OnHand));
    }
}
