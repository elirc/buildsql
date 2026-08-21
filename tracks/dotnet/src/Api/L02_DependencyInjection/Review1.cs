// 02_dependency_injection / review1 - spaced-review variant: when does a scope end?
// See lessons/02_dependency_injection/README.md, "Review".

namespace DotnetDojo.Api.L02_DependencyInjection;

/// <summary>Counts disposals. Given code - do not change it.</summary>
public interface IDisposalLog
{
    int Count { get; }

    void RecordDisposed();
}

public sealed class DisposalLog : IDisposalLog
{
    private int _count;

    public int Count => Volatile.Read(ref _count);

    public void RecordDisposed() => Interlocked.Increment(ref _count);
}

/// <summary>Something that must be cleaned up when the work is over.</summary>
public interface IUnitOfWork : IDisposable
{
    Guid Id { get; }
}

public sealed class UnitOfWork(IDisposalLog log) : IUnitOfWork
{
    public Guid Id { get; } = Guid.NewGuid();

    public void Dispose() => log.RecordDisposed();
}

public record UnitOfWorkResponse(Guid Id, int DisposedBefore);

public class Review1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IDisposalLog, DisposalLog>();
        // TODO review1: with this lifetime the unit of work is never disposed
        // while the application is running.
        services.AddSingleton<IUnitOfWork, UnitOfWork>();
    }
}

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/review/unit-of-work", GetUnitOfWork);
    }

    // 200 with {"id": <this request's unit of work>,
    //           "disposedBefore": <how many units of work were disposed before now>}.
    private static IResult GetUnitOfWork(IUnitOfWork work, IDisposalLog log) =>
        throw new NotImplementedException("review1: GET /l02/review/unit-of-work is not implemented yet - edit src/Api/L02_DependencyInjection/Review1.cs");
}
