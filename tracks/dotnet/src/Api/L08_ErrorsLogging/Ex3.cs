// 08_errors_logging / ex3 - structured logging: the template is the API.
// See lessons/08_errors_logging/README.md, "Exercise 3".

namespace DotnetDojo.Api.L08_ErrorsLogging;

public record ShipResponse(int OrderId, string City);

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l08/orders/{id:int}/ship", Ship);
    }

    // Log, at Information, that this order shipped to this city - with OrderId
    // and City as named properties, not as text you glued together - then
    // answer 200 with {"orderId": …, "city": …}.
    private static IResult Ship(int id, string city, ILogger<Ex3> logger) =>
        throw new NotImplementedException("ex3: POST /l08/orders/{id}/ship is not implemented yet - edit src/Api/L08_ErrorsLogging/Ex3.cs");
}
