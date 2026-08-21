// 02_dependency_injection / review1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L02_DependencyInjection;

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
        services.AddScoped<IUnitOfWork, UnitOfWork>();
    }
}

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/review/unit-of-work", GetUnitOfWork);
    }

    private static IResult GetUnitOfWork(IUnitOfWork work, IDisposalLog log) =>
        TypedResults.Ok(new UnitOfWorkResponse(work.Id, log.Count));
}
