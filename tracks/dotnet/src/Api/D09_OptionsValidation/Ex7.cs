// d09_options_validation / ex7 - fail at startup, not at 3am.
// See lessons/d09_options_validation/README.md, "Exercise 7".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class LicenseOptions
{
    public string Key { get; set; } = "dojo-default-key";

    /// <summary>The default is deliberately valid, so an unconfigured app still boots.</summary>
    public int Seats { get; set; } = 5;
}

public record LicenseResponse(string Key, int Seats);

public class Ex7Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex7: bind "Dojo:D09:License", require that Seats is positive
        // with the message
        //     "Seats must be positive."
        // and make that check run when the application STARTS rather than on
        // first use.
        services.AddOptions<LicenseOptions>();
    }
}

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/license", GetLicense);
    }

    // Given: 200 with {"key": …, "seats": …}.
    private static IResult GetLicense(IOptions<LicenseOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new LicenseResponse(value.Key, value.Seats));
}
