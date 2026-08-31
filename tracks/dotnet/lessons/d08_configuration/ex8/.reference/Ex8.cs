// d08_configuration / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D08_Configuration;

public record EffectiveResponse(string Key, string Value, string Source, string Environment);

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/effective/{key}", GetEffective);
    }

    private static IResult GetEffective(
        IConfiguration configuration, IHostEnvironment environment, string key)
    {
        string name = environment.EnvironmentName;

        string? specific = configuration[$"Dojo:D08:Overrides:{name}:{key}"];

        if (!string.IsNullOrEmpty(specific))
        {
            return TypedResults.Ok(new EffectiveResponse(key, specific, "environment", name));
        }

        string? fallback = configuration[$"Dojo:D08:Overrides:Default:{key}"];

        if (!string.IsNullOrEmpty(fallback))
        {
            return TypedResults.Ok(new EffectiveResponse(key, fallback, "default", name));
        }

        return TypedResults.Ok(new EffectiveResponse(key, "none", "none", name));
    }
}
