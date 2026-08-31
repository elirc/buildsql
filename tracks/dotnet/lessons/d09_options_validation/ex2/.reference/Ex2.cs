// d09_options_validation / ex2 - reference solution (author only, used by `dojo verify`).

using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class SmtpOptions
{
    [Required]
    public string Host { get; set; } = "";

    [Range(1, 65535)]
    public int Port { get; set; } = 25;
}

public record SmtpResponse(string Host, int Port);

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<SmtpOptions>()
            .BindConfiguration("Dojo:D09:Smtp")
            .ValidateDataAnnotations();
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/smtp", GetSmtp);
    }

    private static IResult GetSmtp(IOptions<SmtpOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new SmtpResponse(value.Host, value.Port));
}
