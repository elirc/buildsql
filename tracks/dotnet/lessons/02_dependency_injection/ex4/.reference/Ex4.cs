// 02_dependency_injection / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L02_DependencyInjection;

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
        services.AddScoped<IOrderRule, PositiveTotalRule>();
        services.AddScoped<IOrderRule, MaximumTotalRule>();
        services.AddScoped<IOrderRule, WholeCurrencyRule>();
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/rules", CheckRules);
    }

    private static IResult CheckRules(int totalCents, IEnumerable<IOrderRule> rules)
    {
        var violations = rules
            .Where(r => !r.IsSatisfiedBy(totalCents))
            .Select(r => r.Name)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();

        return TypedResults.Ok(new RuleResponse(violations));
    }
}
