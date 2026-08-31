// d08_configuration / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D08_Configuration;

public record FeatureResponse(List<string> Enabled, int Known);

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/features", GetFeatures);
    }

    private static IResult GetFeatures(IConfiguration configuration)
    {
        var children = configuration.GetSection("Dojo:D08:Features").GetChildren().ToList();

        var enabled = children
            .Where(c => c.Get<bool>())
            .Select(c => c.Key)
            .OrderBy(k => k, StringComparer.Ordinal)
            .ToList();

        return TypedResults.Ok(new FeatureResponse(enabled, children.Count));
    }
}
