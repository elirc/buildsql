// d04_di_lifetimes / ex4 - reference solution (author only, used by `dojo verify`).

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
        services.AddSingleton<IDisposalLog, DisposalLog>();
        services.AddTransient<ILease, Lease>();
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/leases", Get);
    }

    private static IResult Get(IDisposalLog log, ILease first, ILease second) =>
        TypedResults.Ok(new LeaseResponse(log.Count, first.Id, second.Id));
}
