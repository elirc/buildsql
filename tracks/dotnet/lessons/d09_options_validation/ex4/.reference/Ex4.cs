// d09_options_validation / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class QuotaOptions
{
    public int Daily { get; set; } = 100;

    public int Burst { get; set; } = 10;

    public string Tier { get; set; } = "free";
}

public record QuotaResponse(int Daily, int Burst, string Tier);

public class QuotaOptionsValidator : IValidateOptions<QuotaOptions>
{
    public static readonly string[] Tiers = ["free", "pro"];

    public ValidateOptionsResult Validate(string? name, QuotaOptions options)
    {
        var failures = new List<string>();

        if (options.Daily < 1)
        {
            failures.Add("Daily must be at least 1.");
        }

        if (options.Burst > options.Daily)
        {
            failures.Add("Burst must not exceed Daily.");
        }

        if (!Tiers.Contains(options.Tier))
        {
            failures.Add($"Tier '{options.Tier}' is not a tier.");
        }

        return failures.Count > 0
            ? ValidateOptionsResult.Fail(failures)
            : ValidateOptionsResult.Success;
    }
}

public class Ex4Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<QuotaOptions>().BindConfiguration("Dojo:D09:Quota");

        services.AddSingleton<IValidateOptions<QuotaOptions>, QuotaOptionsValidator>();
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/quota", GetQuota);
    }

    private static IResult GetQuota(IOptions<QuotaOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new QuotaResponse(value.Daily, value.Burst, value.Tier));
}
