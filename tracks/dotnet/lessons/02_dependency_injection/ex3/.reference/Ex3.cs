// 02_dependency_injection / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L02_DependencyInjection;

public interface ICorrelation
{
    Guid Id { get; }
}

public sealed class Correlation : ICorrelation
{
    public Guid Id { get; } = Guid.NewGuid();
}

public interface IAuditTrail
{
    int Record(Guid correlationId);
}

public sealed class AuditTrail : IAuditTrail
{
    private readonly List<Guid> _seen = [];

    public int Record(Guid correlationId)
    {
        lock (_seen)
        {
            _seen.Add(correlationId);
            return _seen.Count;
        }
    }
}

public record AuditResponse(Guid CorrelationId, int Seen);

public class Ex3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ICorrelation, Correlation>();
        services.AddSingleton<IAuditTrail, AuditTrail>();
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/audit", Audit);
    }

    private static IResult Audit(ICorrelation correlation, IAuditTrail trail)
    {
        int seen = trail.Record(correlation.Id);
        return TypedResults.Ok(new AuditResponse(correlation.Id, seen));
    }
}
