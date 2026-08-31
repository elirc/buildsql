// d01_routing / ex3 - the verb is half of the route.
// See lessons/d01_routing/README.md, "Exercise 3".

namespace DotnetDojo.Api.D01_Routing;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex3: map PUT and DELETE on "/d01/stops/{id:int}/watch" to the
        // two handlers below. Map nothing else on that path.
    }

    // 204 when the stop exists, 404 when it does not.
    private static IResult Watch(int id) =>
        throw new NotImplementedException(
            "ex3: PUT /d01/stops/{id:int}/watch is not implemented yet - edit src/Api/D01_Routing/Ex3.cs");

    // 204 when the stop exists, 404 when it does not.
    private static IResult Unwatch(int id) =>
        throw new NotImplementedException(
            "ex3: DELETE /d01/stops/{id:int}/watch is not implemented yet - edit src/Api/D01_Routing/Ex3.cs");
}
