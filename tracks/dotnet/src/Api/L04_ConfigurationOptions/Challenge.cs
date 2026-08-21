// 04_configuration_options / challenge - named options.
// See lessons/04_configuration_options/README.md, "Challenge".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.L04_ConfigurationOptions;

/// <summary>One feed's settings. "Dojo:Feeds" holds several of these, by name.</summary>
public class FeedOptions
{
    public string Url { get; set; } = "";

    public int TimeoutSeconds { get; set; } = 10;
}

public record FeedResponse(string Name, string Url, int TimeoutSeconds);

public class ChallengeServices : IServiceRegistrar
{
    public const string Section = "Dojo:Feeds";

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO challenge: register one named FeedOptions per child of "Dojo:Feeds".
    }
}

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/feeds/{name}", GetFeed);
    }

    // 200 with {"name": …, "url": …, "timeoutSeconds": …} for a feed that is
    // configured, 404 for one that is not.
    private static IResult GetFeed(
        string name, IOptionsMonitor<FeedOptions> feeds, IConfiguration configuration) =>
        throw new NotImplementedException("challenge: GET /l04/feeds/{name} is not implemented yet - edit src/Api/L04_ConfigurationOptions/Challenge.cs");
}
