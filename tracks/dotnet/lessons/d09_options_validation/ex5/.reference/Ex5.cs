// d09_options_validation / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class FeedOptions
{
    public string Url { get; set; } = "";

    public int TimeoutSeconds { get; set; } = 10;
}

public record FeedResponse(string Name, string Url, int TimeoutSeconds);

public class Ex5Services : IServiceRegistrar
{
    public static readonly string[] Names = ["primary", "backup"];

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        foreach (string name in Names)
        {
            services.AddOptions<FeedOptions>(name)
                .BindConfiguration($"Dojo:D09:Feeds:{name}")
                .Validate(options => !string.IsNullOrWhiteSpace(options.Url), "Url is required.");
        }
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/feeds/{name}", GetFeed);
    }

    private static IResult GetFeed(IOptionsSnapshot<FeedOptions> feeds, string name)
    {
        // Get(name) happily invents an unbound instance for a name nobody
        // registered, so the endpoint has to know which names exist.
        if (!Ex5Services.Names.Contains(name))
        {
            return TypedResults.NotFound();
        }

        return D09Options.Read(
            () => feeds.Get(name),
            value => new FeedResponse(name, value.Url, value.TimeoutSeconds));
    }
}
