// 02_dependency_injection / ex3 - two lifetimes working together.
// See lessons/02_dependency_injection/README.md, "Exercise 3".

namespace DotnetDojo.Api.L02_DependencyInjection;

/// <summary>An id that identifies one request while it is being handled.</summary>
public interface ICorrelation
{
    Guid Id { get; }
}

public sealed class Correlation : ICorrelation
{
    public Guid Id { get; } = Guid.NewGuid();
}

/// <summary>A log that outlives every request. Given code - do not change it.</summary>
public interface IAuditTrail
{
    /// <summary>Records a correlation id and returns how many have been recorded in total.</summary>
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
        // TODO ex3: both of these lifetimes are wrong, in opposite directions.
        services.AddSingleton<ICorrelation, Correlation>();
        services.AddScoped<IAuditTrail, AuditTrail>();
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/audit", Audit);
    }

    // Record this request's correlation id in the trail, then answer 200 with
    // {"correlationId": …, "seen": <the number Record gave you back>}.
    private static IResult Audit(ICorrelation correlation, IAuditTrail trail) =>
        throw new NotImplementedException("ex3: GET /l02/audit is not implemented yet - edit src/Api/L02_DependencyInjection/Ex3.cs");
}
