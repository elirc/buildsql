// d09_options_validation / ex2 - data annotations on an options class.
// See lessons/d09_options_validation/README.md, "Exercise 2".

using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class SmtpOptions
{
    // TODO ex2: Host is required and Port must be between 1 and 65535.
    public string Host { get; set; } = "";

    public int Port { get; set; } = 25;
}

public record SmtpResponse(string Host, int Port);

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex2: bind "Dojo:D09:Smtp" AND make the annotations above run.
        services.AddOptions<SmtpOptions>();
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/smtp", GetSmtp);
    }

    // Given: 200 with {"host": …, "port": …}, or 500 with the failures.
    private static IResult GetSmtp(IOptions<SmtpOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new SmtpResponse(value.Host, value.Port));
}
