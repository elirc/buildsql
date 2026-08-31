// d08_configuration / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D08_Configuration;

public record LimitsResponse(bool Section, int MaxItems, int TimeoutSeconds);

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/limits", GetLimits);
    }

    private static IResult GetLimits(IConfiguration configuration)
    {
        var section = configuration.GetSection("Dojo:D08:Limits");

        return TypedResults.Ok(new LimitsResponse(
            section.Exists(),
            configuration.GetValue("Dojo:D08:Limits:MaxItems", 50),
            configuration.GetValue("Dojo:D08:Limits:TimeoutSeconds", 30)));
    }
}
