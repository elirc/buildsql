// d08_configuration / ex5 - is the section there, and what if it is not?
// See lessons/d08_configuration/README.md, "Exercise 5".

namespace DotnetDojo.Api.D08_Configuration;

public record LimitsResponse(bool Section, int MaxItems, int TimeoutSeconds);

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/limits", GetLimits);
    }

    // 200 with {"section": …, "maxItems": …, "timeoutSeconds": …}:
    //   section  - whether Dojo:D08:Limits exists at all
    //   maxItems - Dojo:D08:Limits:MaxItems, or 50
    //   timeoutSeconds - Dojo:D08:Limits:TimeoutSeconds, or 30
    private static IResult GetLimits(IConfiguration configuration) =>
        throw new NotImplementedException(
            "ex5: GET /d08/limits is not implemented yet - edit src/Api/D08_Configuration/Ex5.cs");
}
