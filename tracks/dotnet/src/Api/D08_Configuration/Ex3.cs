// d08_configuration / ex3 - arrays are just numbered keys.
// See lessons/d08_configuration/README.md, "Exercise 3".

namespace DotnetDojo.Api.D08_Configuration;

public record MirrorResponse(List<string> Mirrors, int Count);

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/mirrors", GetMirrors);
    }

    // 200 with {"mirrors": [ … ], "count": …} from Dojo:D08:Mirrors, in the
    // order configuration lists them. No section at all is an empty list and a
    // count of 0 - never null, and never a 404.
    private static IResult GetMirrors(IConfiguration configuration) =>
        throw new NotImplementedException(
            "ex3: GET /d08/mirrors is not implemented yet - edit src/Api/D08_Configuration/Ex3.cs");
}
