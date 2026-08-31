// d08_configuration / ex6 - walking a section whose keys you do not know.
// See lessons/d08_configuration/README.md, "Exercise 6".

namespace DotnetDojo.Api.D08_Configuration;

public record FeatureResponse(List<string> Enabled, int Known);

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/features", GetFeatures);
    }

    // 200 with {"enabled": [ … ], "known": …} over Dojo:D08:Features, whose
    // keys are feature names and whose values are booleans. "enabled" holds
    // only the ones that are true, sorted A-Z; "known" counts every key in the
    // section, true or false.
    private static IResult GetFeatures(IConfiguration configuration) =>
        throw new NotImplementedException(
            "ex6: GET /d08/features is not implemented yet - edit src/Api/D08_Configuration/Ex6.cs");
}
