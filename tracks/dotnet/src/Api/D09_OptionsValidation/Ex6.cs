// d09_options_validation / ex6 - the pass that runs after everything else.
// See lessons/d09_options_validation/README.md, "Exercise 6".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class ReportOptions
{
    public string Folder { get; set; } = "";

    public string FileName { get; set; } = "";

    /// <summary>Derived, never configured.</summary>
    public string FullPath { get; set; } = "";
}

public record ReportResponse(string Folder, string FileName, string FullPath);

public class Ex6Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<ReportOptions>().BindConfiguration("Dojo:D09:Report");

        // TODO ex6: after binding, fill in the blanks - a blank FileName
        // becomes "report.csv", and FullPath becomes "{Folder}/{FileName}".
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/report", GetReport);
    }

    // Given: 200 with {"folder": …, "fileName": …, "fullPath": …}.
    private static IResult GetReport(IOptions<ReportOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new ReportResponse(value.Folder, value.FileName, value.FullPath));
}
