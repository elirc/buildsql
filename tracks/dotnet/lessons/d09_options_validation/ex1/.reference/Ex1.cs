// d09_options_validation / ex1 - reference solution (author only, used by `dojo verify`).

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
        services.AddOptions<ArchiveOptions>().BindConfiguration("Dojo:D09:Archive");
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/archive", GetArchive);
    }

    private static IResult GetArchive(IOptions<ArchiveOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new ArchiveResponse(value.Bucket, value.RetentionDays));
}
