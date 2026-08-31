// d08_configuration / ex7 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D08_Configuration;

public enum FeedMode
{
    Poll,
    Push,
}

public class FeedEndpointSettings
{
    public string Url { get; set; } = "";

    public int Weight { get; set; }
}

public class RetrySettings
{
    public int Count { get; set; } = 3;

    public TimeSpan Backoff { get; set; } = TimeSpan.FromSeconds(2);
}

public class FeedSettings
{
    public FeedMode Mode { get; set; } = FeedMode.Poll;

    public TimeSpan Interval { get; set; } = TimeSpan.FromMinutes(5);

    public List<FeedEndpointSettings> Endpoints { get; set; } = [];

    public RetrySettings Retry { get; set; } = new();
}

public record FeedResponse(
    string Mode, int IntervalSeconds, List<string> Endpoints, int RetryCount, int BackoffSeconds);

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/feed", GetFeed);
    }

    private static IResult GetFeed(IConfiguration configuration)
    {
        // One call binds the enum, the TimeSpans, the list of objects and the
        // nested object - and leaves every default it found no key for.
        var feed = configuration.GetSection("Dojo:D08:Feed").Get<FeedSettings>()
                   ?? new FeedSettings();

        return TypedResults.Ok(new FeedResponse(
            feed.Mode.ToString(),
            (int)feed.Interval.TotalSeconds,
            feed.Endpoints.Select(e => $"{e.Url}|{e.Weight}").ToList(),
            feed.Retry.Count,
            (int)feed.Retry.Backoff.TotalSeconds));
    }
}
