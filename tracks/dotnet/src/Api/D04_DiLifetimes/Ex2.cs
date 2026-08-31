// d04_di_lifetimes / ex2 - the captive dependency.
// See lessons/d04_di_lifetimes/README.md, "Exercise 2".

namespace DotnetDojo.Api.D04_DiLifetimes;

/// <summary>A fresh value every time the container is asked for one.</summary>
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

public sealed class ReportBuilder(IStamp stamp) : IReportBuilder
{
    // TODO ex2: this hands back the same stamp for the lifetime of the
    // process. Keep the builder a singleton and fix the capture.
    public Guid Build() => stamp.Value;
}

public record ReportResponse(Guid First, Guid Second);

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // Both lifetimes are correct. Do not change them.
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

    // Given: builds two reports in one request.
    private static IResult Get(IReportBuilder builder) =>
        TypedResults.Ok(new ReportResponse(builder.Build(), builder.Build()));
}
