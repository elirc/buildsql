// d09_options_validation / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class LicenseOptions
{
    public string Key { get; set; } = "dojo-default-key";

    public int Seats { get; set; } = 5;
}

public record LicenseResponse(string Key, int Seats);

public class Ex7Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<LicenseOptions>()
            .BindConfiguration("Dojo:D09:License")
            .Validate(options => options.Seats > 0, "Seats must be positive.")
            .ValidateOnStart();
    }
}

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/license", GetLicense);
    }

    private static IResult GetLicense(IOptions<LicenseOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new LicenseResponse(value.Key, value.Seats));
}
