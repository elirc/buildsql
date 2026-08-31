// d09_options_validation / ex4 - a validator class, and every reason at once.
// See lessons/d09_options_validation/README.md, "Exercise 4".

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

    // TODO ex4: return EVERY reason the options are wrong, not just the first.
    // The three messages are spelled out in the README.
    public ValidateOptionsResult Validate(string? name, QuotaOptions options) =>
        throw new NotImplementedException(
            "ex4: QuotaOptionsValidator is not implemented yet - edit src/Api/D09_OptionsValidation/Ex4.cs");
}

public class Ex4Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<QuotaOptions>().BindConfiguration("Dojo:D09:Quota");

        // TODO ex4: the validator above has to be in the container to run.
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/quota", GetQuota);
    }

    // Given: 200 with {"daily": …, "burst": …, "tier": …}, or 500 with failures.
    private static IResult GetQuota(IOptions<QuotaOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new QuotaResponse(value.Daily, value.Burst, value.Tier));
}
