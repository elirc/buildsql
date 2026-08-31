// d04_di_lifetimes / ex4 - who disposes what, and when.
// See lessons/d04_di_lifetimes/README.md, "Exercise 4".

namespace DotnetDojo.Api.D04_DiLifetimes;

public interface IDisposalLog
{
    int Count { get; }

    void Record();
}

public sealed class DisposalLog : IDisposalLog
{
    private int _count;

    public int Count => Volatile.Read(ref _count);

    public void Record() => Interlocked.Increment(ref _count);
}

/// <summary>A borrowed resource. Every one that is handed out must be given back.</summary>
public interface ILease : IDisposable
{
    Guid Id { get; }
}

public sealed class Lease(IDisposalLog log) : ILease
{
    public Guid Id { get; } = Guid.NewGuid();

    public void Dispose() => log.Record();
}

public record LeaseResponse(int DisposedBefore, Guid First, Guid Second);

public class Ex4Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // Given: the log has to outlive every request. Do not change it.
        services.AddSingleton<IDisposalLog, DisposalLog>();

        // TODO ex4: one of the three lifetimes gives each caller its own lease
        // AND lets the container hand it back when the request ends.
        services.AddScoped<ILease, Lease>();
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/leases", Get);
    }

    // Given: takes two leases and reports how many have been returned so far.
    private static IResult Get(IDisposalLog log, ILease first, ILease second) =>
        TypedResults.Ok(new LeaseResponse(log.Count, first.Id, second.Id));
}
