// 04_configuration_options / challenge - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.L04_ConfigurationOptions;

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
        foreach (var feed in configuration.GetSection(Section).GetChildren())
        {
            services.Configure<FeedOptions>(feed.Key, feed);
        }
    }
}

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/feeds/{name}", GetFeed);
    }

    private static IResult GetFeed(
        string name, IOptionsMonitor<FeedOptions> feeds, IConfiguration configuration)
    {
        var section = configuration.GetSection($"{ChallengeServices.Section}:{name}");
        if (!section.Exists())
        {
            return TypedResults.NotFound();
        }

        var options = feeds.Get(name);
        return TypedResults.Ok(new FeedResponse(name, options.Url, options.TimeoutSeconds));
    }
}
