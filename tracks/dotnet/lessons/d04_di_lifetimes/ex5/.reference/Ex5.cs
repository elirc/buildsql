// d04_di_lifetimes / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DotnetDojo.Api.D04_DiLifetimes;

public interface IGreeter
{
    string Name { get; }
}

public sealed class FormalGreeter : IGreeter
{
    public string Name => "formal";
}

public sealed class CasualGreeter : IGreeter
{
    public string Name => "casual";
}

public sealed class LoudGreeter : IGreeter
{
    public string Name => "loud";
}

public record GreeterResponse(string Single, List<string> All);

public class Ex5Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IGreeter, FormalGreeter>();
        services.AddSingleton<IGreeter, CasualGreeter>();

        // A no-op: something is already registered for IGreeter.
        services.TryAddSingleton<IGreeter, LoudGreeter>();
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/greeters", Get);
    }

    private static IResult Get(IGreeter greeter, IEnumerable<IGreeter> all) =>
        TypedResults.Ok(new GreeterResponse(greeter.Name, all.Select(g => g.Name).ToList()));
}
