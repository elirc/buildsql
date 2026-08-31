// d05_di_patterns / ex2 - reference solution (author only, used by `dojo verify`).

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

        services.AddSingleton<IPricer>(sp => new Pricer(sp.GetRequiredService<IRateSource>().Cents));
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/price", GetPrice);
    }

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
