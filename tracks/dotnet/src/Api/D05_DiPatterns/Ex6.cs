// d05_di_patterns / ex6 - registering a set without registering it twice.
// See lessons/d05_di_patterns/README.md, "Exercise 6".

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
        // TODO ex6: three calls - disk, clock, then disk again. The third one
        // must change nothing, because two modules asking for the same check
        // must not run it twice.
        services.AddSingleton<IStartupCheck, DiskCheck>();
        services.AddSingleton<IStartupCheck, ClockCheck>();
        services.AddSingleton<IStartupCheck, DiskCheck>();
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/checks", Get);
    }

    // Given: reports every registered check, in registration order.
    private static IResult Get(IEnumerable<IStartupCheck> checks)
    {
        var names = checks.Select(c => c.Name).ToList();

        return TypedResults.Ok(new CheckResponse(names, names.Count));
    }
}
