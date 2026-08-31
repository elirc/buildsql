// d05_di_patterns / ex7 - half the constructor from DI, half from the caller.
// See lessons/d05_di_patterns/README.md, "Exercise 7".

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

/// <summary>One dependency the container owns, one argument only the caller knows.</summary>
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
    // TODO ex7: build an ExportJob whose IClock comes from the container and
    // whose label comes from this argument. Do not new up a clock.
    public ExportJob Create(string label) =>
        throw new NotImplementedException(
            "ex7: JobFactory.Create is not implemented yet - edit src/Api/D05_DiPatterns/Ex7.cs");
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

    // Given: builds one job and checks whose clock it ended up with.
    private static IResult Get(IJobFactory factory, IClock clock, string label)
    {
        var job = factory.Create(label);

        return TypedResults.Ok(new JobResponse(job.Describe(), job.ClockId == clock.Id));
    }
}
