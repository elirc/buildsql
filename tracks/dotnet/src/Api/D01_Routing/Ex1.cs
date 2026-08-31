// d01_routing / ex1 - the id in the path selects the row.
// See lessons/d01_routing/README.md, "Exercise 1".

namespace DotnetDojo.Api.D01_Routing;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/stops/{id:int}", GetStop);
    }

    // 200 with the stop that has this id, 404 when the network has no such stop.
    private static IResult GetStop(int id) =>
        throw new NotImplementedException(
            "ex1: GET /d01/stops/{id:int} is not implemented yet - edit src/Api/D01_Routing/Ex1.cs");
}
