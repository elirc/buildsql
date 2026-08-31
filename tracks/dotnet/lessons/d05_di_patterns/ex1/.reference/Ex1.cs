// d05_di_patterns / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D05_DiPatterns;

public interface INotifier
{
    string Channel { get; }

    string Send(string message);
}

public sealed class EmailNotifier : INotifier
{
    public string Channel => "email";

    public string Send(string message) => $"email:{message}";
}

public sealed class SmsNotifier : INotifier
{
    public string Channel => "sms";

    public string Send(string message) => $"sms:{message}";
}

public sealed class PushNotifier : INotifier
{
    public string Channel => "push";

    public string Send(string message) => $"push:{message}";
}

public record NotifyResponse(string Sent, List<string> Channels);

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<INotifier, EmailNotifier>();
        services.AddSingleton<INotifier, SmsNotifier>();
        services.AddSingleton<INotifier, PushNotifier>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/notify/{channel}", Notify);
    }

    private static IResult Notify(
        IEnumerable<INotifier> notifiers, string channel, string? message)
    {
        var all = notifiers.ToList();
        var chosen = all.FirstOrDefault(n => n.Channel == channel);

        if (chosen is null)
        {
            return TypedResults.NotFound();
        }

        var channels = all
            .Select(n => n.Channel)
            .OrderBy(c => c, StringComparer.Ordinal)
            .ToList();

        return TypedResults.Ok(new NotifyResponse(chosen.Send(message ?? ""), channels));
    }
}
