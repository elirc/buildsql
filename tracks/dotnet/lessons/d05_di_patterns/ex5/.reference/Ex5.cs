// d05_di_patterns / ex5 - reference solution (author only, used by `dojo verify`).

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
        services.AddKeyedSingleton<IChannel, EmailChannel>("email");
        services.AddKeyedSingleton<IChannel, SmsChannel>("sms");
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/channels/{key}", Get);
    }

    private static IResult Get(
        [FromKeyedServices("email")] IChannel primary, IServiceProvider services, string key)
    {
        var selected = services.GetKeyedService<IChannel>(key);

        if (selected is null)
        {
            return TypedResults.NotFound();
        }

        var all = services.GetKeyedServices<IChannel>(KeyedService.AnyKey)
            .Select(c => c.Name)
            .OrderBy(n => n, StringComparer.Ordinal)
            .ToList();

        return TypedResults.Ok(new ChannelResponse(primary.Name, selected.Name, all));
    }
}
