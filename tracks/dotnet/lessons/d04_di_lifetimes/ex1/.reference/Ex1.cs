// d04_di_lifetimes / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D04_DiLifetimes;

public interface IWarmCache
{
    Guid Id { get; }
}

public sealed class WarmCache : IWarmCache
{
    public Guid Id { get; } = Guid.NewGuid();
}

public interface ICorrelation
{
    Guid Id { get; }
}

public sealed class Correlation : ICorrelation
{
    public Guid Id { get; } = Guid.NewGuid();
}

public interface IReading
{
    Guid Id { get; }
}

public sealed class Reading : IReading
{
    public Guid Id { get; } = Guid.NewGuid();
}

public record LifetimeResponse(Guid Cache, List<Guid> Correlation, List<Guid> Reading);

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IWarmCache, WarmCache>();
        services.AddScoped<ICorrelation, Correlation>();
        services.AddTransient<IReading, Reading>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/lifetimes", Get);
    }

    private static IResult Get(
        IWarmCache cache,
        ICorrelation firstCorrelation,
        ICorrelation secondCorrelation,
        IReading firstReading,
        IReading secondReading) =>
        TypedResults.Ok(new LifetimeResponse(
            cache.Id,
            [firstCorrelation.Id, secondCorrelation.Id],
            [firstReading.Id, secondReading.Id]));
}
