// d01_routing / ex6 - a literal segment beats a parameter.
// See lessons/d01_routing/README.md, "Exercise 6".

namespace DotnetDojo.Api.D01_Routing;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // Registration order is deliberately "wrong" here. Leave it that way:
        // routing does not care, and proving that to yourself is the exercise.
        app.MapGet("/d01/zones/{zone}", GetZone);
        app.MapGet("/d01/zones/all", ListZones);
    }

    // 200 with every zone the network has, distinct and sorted A-Z.
    private static IResult ListZones() =>
        throw new NotImplementedException(
            "ex6: GET /d01/zones/all is not implemented yet - edit src/Api/D01_Routing/Ex6.cs");

    // 200 with the names of the stops in this zone, sorted A-Z. A zone with no
    // stops does not exist: 404.
    private static IResult GetZone(string zone) =>
        throw new NotImplementedException(
            "ex6: GET /d01/zones/{zone} is not implemented yet - edit src/Api/D01_Routing/Ex6.cs");
}
