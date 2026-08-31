// d24_mixed_gauntlet / ex2 - DI lifetimes seen through one endpoint.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 2".

namespace DotnetDojo.Api.D24_MixedGauntlet;

/// <summary>Identifies THIS request, everywhere in it, and nothing else.</summary>
public interface ID24Visit
{
    string Id { get; }
}

public sealed class D24Visit : ID24Visit
{
    public string Id { get; } = Guid.NewGuid().ToString();
}

/// <summary>A turnstile. The whole application shares one count.</summary>
public interface ID24Turnstile
{
    int Next();
}

public sealed class D24Turnstile : ID24Turnstile
{
    private int _count;

    public int Next() => Interlocked.Increment(ref _count);
}

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex2: both of these are transient, and neither of them should
        // be. One value has to be stable inside a request and new between
        // requests; the other has to survive every request the process sees.
        services.AddTransient<ID24Visit, D24Visit>();
        services.AddTransient<ID24Turnstile, D24Turnstile>();
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d24/visits", Get);
    }

    // Given: asks the container for the visit TWICE in one request and reports
    // whether it got the same object back, plus the turnstile's next number.
    // Do not edit this handler - the exercise is the two registrations above.
    private static IResult Get(ID24Visit first, ID24Visit second, ID24Turnstile turnstile) =>
        TypedResults.Ok(new VisitDto(
            first.Id == second.Id ? first.Id : "different-instances-in-one-request",
            turnstile.Next()));
}
