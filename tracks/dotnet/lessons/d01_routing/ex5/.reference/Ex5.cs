// d01_routing / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D01_Routing;

public record TilePath(string Path, int Segments);

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d01/tiles/{**path}", GetTile);
    }

    private static IResult GetTile(string? path)
    {
        string value = path ?? "";
        int segments = value.Split('/', StringSplitOptions.RemoveEmptyEntries).Length;

        return TypedResults.Ok(new TilePath(value, segments));
    }
}
