// 04_configuration_options / ex2 - defaults, and what a partial section does to them.
// See lessons/04_configuration_options/README.md, "Exercise 2".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.L04_ConfigurationOptions;

/// <summary>The shape of the "Dojo:Reports" section - which only sets one of these three.</summary>
public class ReportOptions
{
    // TODO ex2: two of these three need a sensible default. The README says which.
    public int MaxRows { get; set; }

    public string Format { get; set; } = "";

    public bool IncludeHeaders { get; set; }
}

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex2: bind ReportOptions to the "Dojo:Reports" configuration section.
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/report-options", GetReportOptions);
    }

    // 200 with {"maxRows": …, "format": …, "includeHeaders": …}.
    private static IResult GetReportOptions(IOptions<ReportOptions> options) =>
        throw new NotImplementedException("ex2: GET /l04/report-options is not implemented yet - edit src/Api/L04_ConfigurationOptions/Ex2.cs");
}
