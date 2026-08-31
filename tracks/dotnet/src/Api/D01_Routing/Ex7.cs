// d01_routing / ex7 - name an endpoint, then generate its URL.
// See lessons/d01_routing/README.md, "Exercise 7".

namespace DotnetDojo.Api.D01_Routing;

public record RouteInfo(int Id, string Line);

public record RouteLinks(string Self, string? Next);

public class Ex7 : IEndpointMapper
{
    public const string RouteName = "d01-route";

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex7: this endpoint needs the name Ex7.RouteName.
        app.MapGet("/d01/routes/{id:int}", GetRoute);

        app.MapGet("/d01/routes/{id:int}/link", GetLinks);
    }

    // 200 with {"id": …, "line": …}; route 1 is Network.Lines[0]. 404 when
    // there is no such route.
    private static IResult GetRoute(int id) =>
        throw new NotImplementedException(
            "ex7: GET /d01/routes/{id:int} is not implemented yet - edit src/Api/D01_Routing/Ex7.cs");

    // 200 with {"self": …, "next": …}, both built by the LinkGenerator from
    // the NAME of the route endpoint - never by pasting strings together.
    // "next" is null for the last route. 404 when there is no such route.
    private static IResult GetLinks(int id, LinkGenerator links, HttpContext http) =>
        throw new NotImplementedException(
            "ex7: GET /d01/routes/{id:int}/link is not implemented yet - edit src/Api/D01_Routing/Ex7.cs");
}
