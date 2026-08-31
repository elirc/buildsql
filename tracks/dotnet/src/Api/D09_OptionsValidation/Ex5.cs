// d09_options_validation / ex5 - two named instances of one options class.
// See lessons/d09_options_validation/README.md, "Exercise 5".

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
        // TODO ex5: one named registration per name in Names, each bound to
        // "Dojo:D09:Feeds:{name}" and each carrying the rule that Url must not
        // be blank, with the message:
        //     "Url is required."
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/feeds/{name}", GetFeed);
    }

    // 200 with {"name": …, "url": …, "timeoutSeconds": …} for a name this
    // application configures, 404 for anything else, 500 when that named
    // instance fails validation.
    private static IResult GetFeed(IOptionsSnapshot<FeedOptions> feeds, string name) =>
        throw new NotImplementedException(
            "ex5: GET /d09/feeds/{name} is not implemented yet - edit src/Api/D09_OptionsValidation/Ex5.cs");
}
