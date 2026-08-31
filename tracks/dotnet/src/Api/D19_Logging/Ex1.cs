// d19_logging / ex1 - a template, not a string.
// See lessons/d19_logging/README.md, "Exercise 1".

namespace DotnetDojo.Api.D19_Logging;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/picks/{id:int}/start", Start);
    }

    // 404 for an unknown pick. Otherwise 200 with a StartedPick, having
    // written exactly one Information entry whose message template names two
    // properties: PickId and OrderRef.
    private static IResult Start(int id, ILogger<Ex1> logger)
    {
        var pick = D19Warehouse.Find(id);
        if (pick is null)
        {
            return TypedResults.NotFound();
        }

        // TODO ex1: this renders the same sentence and carries no properties
        // at all, so "show me every start for order SO-1001" becomes a
        // substring search over free text.
        logger.LogInformation($"Pick {pick.Id} started for order {pick.OrderRef}");

        return TypedResults.Ok(new StartedPick(pick.Id, pick.OrderRef));
    }
}
