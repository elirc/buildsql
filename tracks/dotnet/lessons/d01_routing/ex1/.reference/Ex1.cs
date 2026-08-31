// d01_routing / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D01_Routing;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/stops/{id:int}", GetStop);
    }

    private static IResult GetStop(int id)
    {
        var stop = Network.Stops.FirstOrDefault(s => s.Id == id);

        return stop is null ? TypedResults.NotFound() : TypedResults.Ok(stop);
    }
}
