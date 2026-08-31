// d19_logging / ex6 - one line per request, not one per step.
// See lessons/d19_logging/README.md, "Exercise 6".

namespace DotnetDojo.Api.D19_Logging;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/picks/{id:int}/complete", Complete);
    }

    // 404 for an unknown pick, otherwise 200 with a CompletedPick where Items
    // is the total quantity wanted across the pick's lines. EXACTLY ONE entry
    // is written per request, and it carries both PickId and Items.
    private static IResult Complete(int id, ILogger<Ex6> logger)
    {
        // TODO ex6: six lines to say one thing. Every one of them is a row in
        // the log store, a line on the bill, and a distraction between the
        // reader and the entry that matters.
        logger.LogInformation("Entering Complete");
        logger.LogInformation("Looking up pick {PickId}", id);

        var pick = D19Warehouse.Find(id);
        if (pick is null)
        {
            logger.LogInformation("Not found");
            return TypedResults.NotFound();
        }

        logger.LogInformation("Found pick with {LineCount} lines", pick.Lines.Count);

        int items = pick.Lines.Sum(l => l.Wanted);

        logger.LogInformation("Counted {Items} items", items);
        logger.LogInformation("Leaving Complete");

        return TypedResults.Ok(new CompletedPick(pick.Id, items));
    }
}
