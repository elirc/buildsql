// d09_options_validation / ex1 - a section, a class, an IOptions<T>.
// See lessons/d09_options_validation/README.md, "Exercise 1".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class ArchiveOptions
{
    public string Bucket { get; set; } = "";

    public int RetentionDays { get; set; } = 30;
}

public record ArchiveResponse(string Bucket, int RetentionDays);

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex1: bind ArchiveOptions to the "Dojo:D09:Archive" section.
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/archive", GetArchive);
    }

    // Given: 200 with {"bucket": …, "retentionDays": …}.
    private static IResult GetArchive(IOptions<ArchiveOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new ArchiveResponse(value.Bucket, value.RetentionDays));
}
