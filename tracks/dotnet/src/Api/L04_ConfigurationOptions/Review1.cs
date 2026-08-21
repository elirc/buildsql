// 04_configuration_options / review1 - spaced-review variant: bind, default, read per request.
// See lessons/04_configuration_options/README.md, "Review".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.L04_ConfigurationOptions;

/// <summary>The shape of the "Dojo:Mailer" section - which only sets one of these.</summary>
public class MailerOptions
{
    // TODO review1: give two of these three the defaults the README asks for.
    public string FromAddress { get; set; } = "";

    public string DisplayName { get; set; } = "";

    public int RetryCount { get; set; }
}

public record MailerResponse(string FromAddress, string DisplayName, int RetryCount);

public class Review1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO review1: bind MailerOptions to the "Dojo:Mailer" configuration section.
    }
}

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/review/mailer", GetMailer);
    }

    // 200 with {"fromAddress": …, "displayName": …, "retryCount": …}.
    // Note the parameter type: this one is re-read once per request.
    private static IResult GetMailer(IOptionsSnapshot<MailerOptions> options) =>
        throw new NotImplementedException("review1: GET /l04/review/mailer is not implemented yet - edit src/Api/L04_ConfigurationOptions/Review1.cs");
}
