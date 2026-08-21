// 04_configuration_options / review1 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.L04_ConfigurationOptions;

public class MailerOptions
{
    public string FromAddress { get; set; } = "";

    public string DisplayName { get; set; } = "Dojo";

    public int RetryCount { get; set; } = 3;
}

public record MailerResponse(string FromAddress, string DisplayName, int RetryCount);

public class Review1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MailerOptions>(configuration.GetSection("Dojo:Mailer"));
    }
}

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/review/mailer", GetMailer);
    }

    private static IResult GetMailer(IOptionsSnapshot<MailerOptions> options) =>
        TypedResults.Ok(options.Value);
}
