// d19_logging / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D19_Logging;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/picks/{id:int}/complete", Complete);
    }

    private static IResult Complete(int id, ILogger<Ex6> logger)
    {
        var pick = D19Warehouse.Find(id);
        if (pick is null)
        {
            logger.LogInformation("Complete against unknown pick {PickId}", id);
            return TypedResults.NotFound();
        }

        int items = pick.Lines.Sum(l => l.Wanted);

        // One request, one entry, carrying everything the five removed lines
        // were between them trying to say.
        logger.LogInformation("Pick {PickId} completed with {Items} items", pick.Id, items);

        return TypedResults.Ok(new CompletedPick(pick.Id, items));
    }
}
