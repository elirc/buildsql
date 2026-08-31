// d04_di_lifetimes / ex5 - Add appends, the last one wins, TryAdd gives up.
// See lessons/d04_di_lifetimes/README.md, "Exercise 5".

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
        // TODO ex5: three calls, in the right order, so that IGreeter resolves
        // to the casual one, the enumerable holds formal then casual, and the
        // loud one never appears at all.
        services.AddSingleton<IGreeter, CasualGreeter>();
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/greeters", Get);
    }

    // Given: asks for one greeter, and then for all of them.
    private static IResult Get(IGreeter greeter, IEnumerable<IGreeter> all) =>
        TypedResults.Ok(new GreeterResponse(greeter.Name, all.Select(g => g.Name).ToList()));
}
