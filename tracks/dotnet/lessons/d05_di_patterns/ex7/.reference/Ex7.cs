// d05_di_patterns / ex7 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D05_DiPatterns;

public interface IClock
{
    Guid Id { get; }

    string Now { get; }
}

public sealed class FixedClock : IClock
{
    public Guid Id { get; } = Guid.NewGuid();

    public string Now => "2026-01-01";
}

public sealed class ExportJob(IClock clock, string label)
{
    public Guid ClockId => clock.Id;

    public string Describe() => $"{label}@{clock.Now}";
}

public interface IJobFactory
{
    ExportJob Create(string label);
}

public sealed class JobFactory(IServiceProvider services) : IJobFactory
{
    public ExportJob Create(string label) =>
        ActivatorUtilities.CreateInstance<ExportJob>(services, label);
}

public record JobResponse(string Describe, bool ClockFromContainer);

public class Ex7Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IClock, FixedClock>();
        services.AddSingleton<IJobFactory, JobFactory>();
    }
}

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/jobs/{label}", Get);
    }

    private static IResult Get(IJobFactory factory, IClock clock, string label)
    {
        var job = factory.Create(label);

        return TypedResults.Ok(new JobResponse(job.Describe(), job.ClockId == clock.Id));
    }
}
