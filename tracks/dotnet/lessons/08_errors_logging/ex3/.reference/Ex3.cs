// 08_errors_logging / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L08_ErrorsLogging;

public record ShipResponse(int OrderId, string City);

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l08/orders/{id:int}/ship", Ship);
    }

    private static IResult Ship(int id, string city, ILogger<Ex3> logger)
    {
        logger.LogInformation("Order {OrderId} shipped to {City}", id, city);
        return TypedResults.Ok(new ShipResponse(id, city));
    }
}
