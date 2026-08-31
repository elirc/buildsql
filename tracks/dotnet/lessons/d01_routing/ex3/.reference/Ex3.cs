// d01_routing / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D01_Routing;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d01/stops/{id:int}/watch", Watch);
        app.MapDelete("/d01/stops/{id:int}/watch", Unwatch);
    }

    private static IResult Watch(int id) =>
        Network.Stops.Any(s => s.Id == id)
            ? TypedResults.NoContent()
            : TypedResults.NotFound();

    private static IResult Unwatch(int id) =>
        Network.Stops.Any(s => s.Id == id)
            ? TypedResults.NoContent()
            : TypedResults.NotFound();
}
