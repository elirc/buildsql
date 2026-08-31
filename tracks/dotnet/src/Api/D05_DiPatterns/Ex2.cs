// d05_di_patterns / ex2 - a factory registration, when a constructor is not enough.
// See lessons/d05_di_patterns/README.md, "Exercise 2".

namespace DotnetDojo.Api.D05_DiPatterns;

public interface IRateSource
{
    int Cents { get; }
}

public sealed class RateSource : IRateSource
{
    public int Cents => 250;
}

public interface IPricer
{
    int Quote(int units);
}

/// <summary>Takes a plain int, so the container cannot build it by convention.</summary>
public sealed class Pricer(int rateCents) : IPricer
{
    public int Quote(int units) => rateCents * units;
}

public record PriceResponse(int Units, int Quote);

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IRateSource, RateSource>();

        // TODO ex2: build the pricer from the rate the container is holding,
        // rather than from a number you typed in here.
        services.AddSingleton<IPricer>(sp => new Pricer(0));
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/price", GetPrice);
    }

    // Given: 200 with {"units": …, "quote": …}; units below 1 is a 400.
    private static IResult GetPrice(IPricer pricer, int? units)
    {
        int wanted = units ?? 1;

        if (wanted < 1)
        {
            return TypedResults.BadRequest("units must be at least 1.");
        }

        return TypedResults.Ok(new PriceResponse(wanted, pricer.Quote(wanted)));
    }
}
