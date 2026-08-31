// d08_configuration / ex2 - bind a section onto an object with defaults.
// See lessons/d08_configuration/README.md, "Exercise 2".

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

    // 200 with {"from": …, "retries": …} bound from the Dojo:D08:Mailer
    // section. Keys the section does not mention must keep the class defaults.
    private static IResult GetMailer(IConfiguration configuration) =>
        throw new NotImplementedException(
            "ex2: GET /d08/mailer is not implemented yet - edit src/Api/D08_Configuration/Ex2.cs");
}
