// d08_configuration / ex7 - the binder converts more than you think.
// See lessons/d08_configuration/README.md, "Exercise 7".

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

    // 200 with the whole Dojo:D08:Feed tree bound onto FeedSettings in one
    // call, reported as:
    //   {"mode": …, "intervalSeconds": …, "endpoints": ["url|weight", …],
    //    "retryCount": …, "backoffSeconds": …}
    private static IResult GetFeed(IConfiguration configuration) =>
        throw new NotImplementedException(
            "ex7: GET /d08/feed is not implemented yet - edit src/Api/D08_Configuration/Ex7.cs");
}
