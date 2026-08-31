// d04_di_lifetimes / ex1 - three requirements, three lifetimes.
// See lessons/d04_di_lifetimes/README.md, "Exercise 1".

namespace DotnetDojo.Api.D04_DiLifetimes;

/// <summary>A warm cache. Building it is expensive and the whole app shares one.</summary>
public interface IWarmCache
{
    Guid Id { get; }
}

public sealed class WarmCache : IWarmCache
{
    public Guid Id { get; } = Guid.NewGuid();
}

/// <summary>The id that identifies THIS request, everywhere it is asked for.</summary>
public interface ICorrelation
{
    Guid Id { get; }
}

public sealed class Correlation : ICorrelation
{
    public Guid Id { get; } = Guid.NewGuid();
}

/// <summary>A sensor reading. It must be fresh every single time it is taken.</summary>
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
        // TODO ex1: three registrations and three different lifetimes. Two of
        // these three are wrong.
        services.AddTransient<IWarmCache, WarmCache>();
        services.AddTransient<ICorrelation, Correlation>();
        services.AddTransient<IReading, Reading>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/lifetimes", Get);
    }

    // Given: asks the container for each service twice and reports what it got.
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
