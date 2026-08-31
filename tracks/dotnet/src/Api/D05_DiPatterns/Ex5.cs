// d05_di_patterns / ex5 - keyed services.
// See lessons/d05_di_patterns/README.md, "Exercise 5".

namespace DotnetDojo.Api.D05_DiPatterns;

public interface IChannel
{
    string Name { get; }
}

public sealed class EmailChannel : IChannel
{
    public string Name => "email";
}

public sealed class SmsChannel : IChannel
{
    public string Name => "sms";
}

public record ChannelResponse(string Primary, string Selected, List<string> All);

public class Ex5Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex5: register both channels under the keys "email" and "sms".
        services.AddSingleton<IChannel, EmailChannel>();
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/channels/{key}", Get);
    }

    // 200 with {"primary": …, "selected": …, "all": [ … ]}:
    //   primary  - always the "email" channel, injected by key
    //   selected - the channel whose key is in the route; 404 when there is none
    //   all      - every keyed channel's name, sorted A-Z
    //
    // TODO ex5: the first parameter needs an attribute.
    private static IResult Get(IChannel primary, IServiceProvider services, string key) =>
        throw new NotImplementedException(
            "ex5: GET /d05/channels/{key} is not implemented yet - edit src/Api/D05_DiPatterns/Ex5.cs");
}
