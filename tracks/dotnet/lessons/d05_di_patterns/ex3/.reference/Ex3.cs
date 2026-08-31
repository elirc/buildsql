// d05_di_patterns / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D05_DiPatterns;

public interface IAuditTrail
{
    IReadOnlyList<string> Messages { get; }

    void Record(string message);
}

public sealed class AuditTrail : IAuditTrail
{
    private readonly List<string> _messages = [];

    public IReadOnlyList<string> Messages
    {
        get
        {
            lock (_messages)
            {
                return _messages.ToList();
            }
        }
    }

    public void Record(string message)
    {
        lock (_messages)
        {
            _messages.Add(message);
        }
    }
}

public interface IMessageSink
{
    string Handle(string message);
}

public sealed class CoreSink : IMessageSink
{
    public string Handle(string message) => $"core({message})";
}

public sealed class UppercaseSink(IMessageSink inner) : IMessageSink
{
    public string Handle(string message) => inner.Handle(message.ToUpperInvariant());
}

public sealed class AuditSink(IMessageSink inner, IAuditTrail trail) : IMessageSink
{
    public string Handle(string message)
    {
        trail.Record(message);

        return $"audit[{inner.Handle(message)}]";
    }
}

public record SinkResponse(string Result, List<string> Audited);

public class Ex3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAuditTrail, AuditTrail>();

        services.AddSingleton<IMessageSink>(sp => new AuditSink(
            new UppercaseSink(new CoreSink()),
            sp.GetRequiredService<IAuditTrail>()));
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/sink", Handle);
    }

    private static IResult Handle(IMessageSink sink, IAuditTrail trail, string? message) =>
        TypedResults.Ok(new SinkResponse(
            sink.Handle(message ?? ""), trail.Messages.ToList()));
}
