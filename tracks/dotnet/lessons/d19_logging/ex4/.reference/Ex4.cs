// d19_logging / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D19_Logging;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d19/picks/{id:int}", One);
    }

    // ILogger<Ex4> asks the framework for a logger whose category is this
    // type's full name, which is what every appsettings.json filter and every
    // log query in the world is written against.
    private static IResult One(int id, ILogger<Ex4> logger)
    {
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
