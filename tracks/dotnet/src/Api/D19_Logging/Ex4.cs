// d19_logging / ex4 - the category says where the line came from.
// See lessons/d19_logging/README.md, "Exercise 4".

namespace DotnetDojo.Api.D19_Logging;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d19/picks/{id:int}", One);
    }

    // 404 for an unknown pick, 200 with a PickDto otherwise. Either way,
    // exactly one Information entry, and its CATEGORY must be
    // "DotnetDojo.Api.D19_Logging.Ex4" - the type that wrote it.
    private static IResult One(int id, ILoggerFactory factory)
    {
        // TODO ex4: a hand-written category is a string that nobody renames
        // when the class moves, and it cannot be filtered by namespace.
        var logger = factory.CreateLogger("picking");

        var pick = D19Warehouse.Find(id);
        if (pick is null)
        {
            logger.LogInformation("Pick {PickId} was asked for and does not exist", id);
            return TypedResults.NotFound();
        }

        logger.LogInformation("Pick {PickId} read", pick.Id);

        return TypedResults.Ok(new PickDto(pick.Id, pick.OrderRef, pick.Lines.Count));
    }
}
