// d01_routing / ex5 - the catch-all parameter.
// See lessons/d01_routing/README.md, "Exercise 5".

namespace DotnetDojo.Api.D01_Routing;

public record TilePath(string Path, int Segments);

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex5: this template only ever matches ONE segment. The README
        // says which two characters change that.
        app.MapGet("/d01/tiles/{path}", GetTile);
    }

    // 200 with {"path": …, "segments": …} where path is everything after
    // /d01/tiles/ and segments counts the non-empty segments in it.
    private static IResult GetTile(string? path) =>
        throw new NotImplementedException(
            "ex5: GET /d01/tiles/{path} is not implemented yet - edit src/Api/D01_Routing/Ex5.cs");
}
