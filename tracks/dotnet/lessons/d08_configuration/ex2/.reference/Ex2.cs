// d08_configuration / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D08_Configuration;

public class MailerSettings
{
    public string From { get; set; } = "dojo@example.com";

    public int Retries { get; set; } = 3;
}

public record MailerResponse(string From, int Retries);

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/mailer", GetMailer);
    }

    private static IResult GetMailer(IConfiguration configuration)
    {
        // Get<T> builds the object, runs its field initialisers, and then
        // writes only the properties it found keys for.
        var settings = configuration.GetSection("Dojo:D08:Mailer").Get<MailerSettings>()
                       ?? new MailerSettings();

        return TypedResults.Ok(new MailerResponse(settings.From, settings.Retries));
    }
}
