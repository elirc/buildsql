// d08_configuration / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D08_Configuration;

public record MirrorResponse(List<string> Mirrors, int Count);

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/mirrors", GetMirrors);
    }

    private static IResult GetMirrors(IConfiguration configuration)
    {
        var mirrors = configuration.GetSection("Dojo:D08:Mirrors").Get<List<string>>() ?? [];

        return TypedResults.Ok(new MirrorResponse(mirrors, mirrors.Count));
    }
}
