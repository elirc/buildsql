// 02_dependency_injection / ex4 - many implementations of one interface.
// See lessons/02_dependency_injection/README.md, "Exercise 4".

namespace DotnetDojo.Api.L02_DependencyInjection;

/// <summary>One rule an order total has to satisfy. Given code - do not change these.</summary>
public interface IOrderRule
{
    string Name { get; }

    bool IsSatisfiedBy(int totalCents);
}

public sealed class PositiveTotalRule : IOrderRule
{
    public string Name => nameof(PositiveTotalRule);

    public bool IsSatisfiedBy(int totalCents) => totalCents > 0;
}

public sealed class MaximumTotalRule : IOrderRule
{
    public string Name => nameof(MaximumTotalRule);

    public bool IsSatisfiedBy(int totalCents) => totalCents <= 50_000;
}

public sealed class WholeCurrencyRule : IOrderRule
{
    public string Name => nameof(WholeCurrencyRule);

    public bool IsSatisfiedBy(int totalCents) => totalCents % 100 == 0;
}

public record RuleResponse(List<string> Violations);

public class Ex4Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex4: two of the three rules never reach the endpoint.
        services.AddScoped<IOrderRule, PositiveTotalRule>();
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/rules", CheckRules);
    }

    // 200 with {"violations": [names of the rules this total breaks, sorted A-Z]}.
    private static IResult CheckRules(int totalCents, IEnumerable<IOrderRule> rules) =>
        throw new NotImplementedException("ex4: GET /l02/rules is not implemented yet - edit src/Api/L02_DependencyInjection/Ex4.cs");
}
