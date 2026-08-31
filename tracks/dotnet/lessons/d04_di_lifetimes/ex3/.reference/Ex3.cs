// d04_di_lifetimes / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D04_DiLifetimes;

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

public sealed class JobRunner(IServiceScopeFactory scopes) : IJobRunner
{
    public Guid RunOnce()
    {
        using var scope = scopes.CreateScope();

        return scope.ServiceProvider.GetRequiredService<IJobUnit>().Id;
    }
}

public record JobResponse(Guid First, Guid Second, Guid Request);

public class Ex3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
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

    private static IResult Get(IJobRunner runner, IJobUnit unit) =>
        TypedResults.Ok(new JobResponse(runner.RunOnce(), runner.RunOnce(), unit.Id));
}
