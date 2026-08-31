// d04_di_lifetimes / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D04_DiLifetimes;

public interface IStamp
{
    Guid Value { get; }
}

public sealed class Stamp : IStamp
{
    public Guid Value { get; } = Guid.NewGuid();
}

public interface IReportBuilder
{
    Guid Build();
}

public sealed class ReportBuilder(IServiceProvider services) : IReportBuilder
{
    // The dependency is resolved per call, so the singleton never holds one.
    public Guid Build() => services.GetRequiredService<IStamp>().Value;
}

public record ReportResponse(Guid First, Guid Second);

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddTransient<IStamp, Stamp>();
        services.AddSingleton<IReportBuilder, ReportBuilder>();
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/report", Get);
    }

    private static IResult Get(IReportBuilder builder) =>
        TypedResults.Ok(new ReportResponse(builder.Build(), builder.Build()));
}
