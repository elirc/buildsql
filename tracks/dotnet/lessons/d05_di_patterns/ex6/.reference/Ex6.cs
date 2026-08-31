// d05_di_patterns / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DotnetDojo.Api.D05_DiPatterns;

public interface IStartupCheck
{
    string Name { get; }
}

public sealed class DiskCheck : IStartupCheck
{
    public string Name => "disk";
}

public sealed class ClockCheck : IStartupCheck
{
    public string Name => "clock";
}

public record CheckResponse(List<string> Names, int Count);

public class Ex6Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.TryAddEnumerable(ServiceDescriptor.Singleton<IStartupCheck, DiskCheck>());
        services.TryAddEnumerable(ServiceDescriptor.Singleton<IStartupCheck, ClockCheck>());

        // A no-op: DiskCheck is already in the set.
        services.TryAddEnumerable(ServiceDescriptor.Singleton<IStartupCheck, DiskCheck>());
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/checks", Get);
    }

    private static IResult Get(IEnumerable<IStartupCheck> checks)
    {
        var names = checks.Select(c => c.Name).ToList();

        return TypedResults.Ok(new CheckResponse(names, names.Count));
    }
}
