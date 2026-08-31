// d19_logging / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D19_Logging;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d19/picks/{id:int}/start", Start);
    }

    private static IResult Start(int id, ILogger<Ex1> logger)
    {
        var pick = D19Warehouse.Find(id);
        if (pick is null)
        {
            return TypedResults.NotFound();
        }

        // The template stays a template all the way into the logger, which
        // means the entry carries PickId and OrderRef as named values AND
        // still renders as a sentence a human can read.
        logger.LogInformation(
            "Pick {PickId} started for order {OrderRef}", pick.Id, pick.OrderRef);

        return TypedResults.Ok(new StartedPick(pick.Id, pick.OrderRef));
    }
}
