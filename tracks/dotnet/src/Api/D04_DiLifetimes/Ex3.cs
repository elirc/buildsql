// d04_di_lifetimes / ex3 - a singleton that needs a scoped service.
// See lessons/d04_di_lifetimes/README.md, "Exercise 3".

namespace DotnetDojo.Api.D04_DiLifetimes;

/// <summary>A unit of work. One per scope, and never shared between two.</summary>
public interface IJobUnit
{
    Guid Id { get; }
}

public sealed class JobUnit : IJobUnit
{
    public Guid Id { get; } = Guid.NewGuid();
}

public interface IJobRunner
{
    Guid RunOnce();
}

public sealed class JobRunner(IServiceProvider services) : IJobRunner
{
    // TODO ex3: a singleton cannot resolve a scoped service from the provider
    // it was built with. Give each run its own scope instead.
    public Guid RunOnce() => services.GetRequiredService<IJobUnit>().Id;
}

public record JobResponse(Guid First, Guid Second, Guid Request);

public class Ex3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // Both lifetimes are correct. Do not change them.
        services.AddScoped<IJobUnit, JobUnit>();
        services.AddSingleton<IJobRunner, JobRunner>();
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/job", Get);
    }

    // Given: runs the job twice, and also reports the request's own unit.
    private static IResult Get(IJobRunner runner, IJobUnit unit) =>
        TypedResults.Ok(new JobResponse(runner.RunOnce(), runner.RunOnce(), unit.Id));
}
