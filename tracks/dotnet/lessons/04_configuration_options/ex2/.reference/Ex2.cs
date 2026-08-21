// 04_configuration_options / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.L04_ConfigurationOptions;

public class ReportOptions
{
    public int MaxRows { get; set; } = 100;

    public string Format { get; set; } = "csv";

    public bool IncludeHeaders { get; set; } = true;
}

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<ReportOptions>(configuration.GetSection("Dojo:Reports"));
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/report-options", GetReportOptions);
    }

    private static IResult GetReportOptions(IOptions<ReportOptions> options) =>
        TypedResults.Ok(options.Value);
}
