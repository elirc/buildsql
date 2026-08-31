// d05_di_patterns / ex1 - many implementations, one chosen at runtime.
// See lessons/d05_di_patterns/README.md, "Exercise 1".

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
        // TODO ex1: every notifier has to be reachable through INotifier.
        services.AddSingleton<INotifier, EmailNotifier>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/notify/{channel}", Notify);
    }

    // 200 with {"sent": …, "channels": [ … ]} - what the chosen notifier
    // produced, and every channel the application knows, sorted A-Z.
    // A channel nobody implements is a 404.
    private static IResult Notify(
        IEnumerable<INotifier> notifiers, string channel, string? message) =>
        throw new NotImplementedException(
            "ex1: GET /d05/notify/{channel} is not implemented yet - edit src/Api/D05_DiPatterns/Ex1.cs");
}
