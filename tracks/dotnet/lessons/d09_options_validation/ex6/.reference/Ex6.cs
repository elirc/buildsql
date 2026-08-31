// d09_options_validation / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class ReportOptions
{
    public string Folder { get; set; } = "";

    public string FileName { get; set; } = "";

    public string FullPath { get; set; } = "";
}

public record ReportResponse(string Folder, string FileName, string FullPath);

public class Ex6Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<ReportOptions>().BindConfiguration("Dojo:D09:Report");

        // Runs after every Configure and every binding, so it can see the
        // final values and derive from them.
        services.PostConfigure<ReportOptions>(options =>
        {
            if (string.IsNullOrWhiteSpace(options.FileName))
            {
                options.FileName = "report.csv";
            }

            options.FullPath = $"{options.Folder}/{options.FileName}";
        });
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/report", GetReport);
    }

    private static IResult GetReport(IOptions<ReportOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new ReportResponse(value.Folder, value.FileName, value.FullPath));
}
