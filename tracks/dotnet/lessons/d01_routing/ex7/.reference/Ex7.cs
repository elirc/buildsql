// d01_routing / ex7 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D01_Routing;

public record RouteInfo(int Id, string Line);

public record RouteLinks(string Self, string? Next);

public class Ex7 : IEndpointMapper
{
    public const string RouteName = "d01-route";

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/routes/{id:int}", GetRoute).WithName(RouteName);

        app.MapGet("/d01/routes/{id:int}/link", GetLinks);
    }

    private static IResult GetRoute(int id) =>
        id >= 1 && id <= Network.Lines.Count
            ? TypedResults.Ok(new RouteInfo(id, Network.Lines[id - 1]))
            : TypedResults.NotFound();

    private static IResult GetLinks(int id, LinkGenerator links, HttpContext http)
    {
        if (id < 1 || id > Network.Lines.Count)
        {
            return TypedResults.NotFound();
        }

        string self = links.GetPathByName(http, RouteName, new { id })!;
        string? next = id < Network.Lines.Count
            ? links.GetPathByName(http, RouteName, new { id = id + 1 })
            : null;

        return TypedResults.Ok(new RouteLinks(self, next));
    }
}
