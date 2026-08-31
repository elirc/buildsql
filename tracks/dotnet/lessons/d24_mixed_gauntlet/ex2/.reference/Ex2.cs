// d24_mixed_gauntlet / ex2 - reference solution (author only, used by `dojo verify`).

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
        // Scoped: one instance per request, however many times it is asked
        // for, and a fresh one for the next request.
        services.AddScoped<ID24Visit, D24Visit>();

        // Singleton: one instance for the life of the process, which is the
        // only lifetime that can hold a count that outlives a request.
        services.AddSingleton<ID24Turnstile, D24Turnstile>();
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
    private static IResult Get(ID24Visit first, ID24Visit second, ID24Turnstile turnstile) =>
        TypedResults.Ok(new VisitDto(
            first.Id == second.Id ? first.Id : "different-instances-in-one-request",
            turnstile.Next()));
}
