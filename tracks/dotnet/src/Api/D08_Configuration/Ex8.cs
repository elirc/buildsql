// d08_configuration / ex8 - the environment picks which override wins.
// See lessons/d08_configuration/README.md, "Exercise 8".

namespace DotnetDojo.Api.D08_Configuration;

public record EffectiveResponse(string Key, string Value, string Source, string Environment);

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/effective/{key}", GetEffective);
    }

    // 200 with {"key": …, "value": …, "source": …, "environment": …}.
    //
    // The value is the first of these that configuration actually has:
    //   Dojo:D08:Overrides:{environment}:{key}   -> source "environment"
    //   Dojo:D08:Overrides:Default:{key}         -> source "default"
    //   neither                                  -> value "none", source "none"
    private static IResult GetEffective(
        IConfiguration configuration, IHostEnvironment environment, string key) =>
        throw new NotImplementedException(
            "ex8: GET /d08/effective/{key} is not implemented yet - edit src/Api/D08_Configuration/Ex8.cs");
}
