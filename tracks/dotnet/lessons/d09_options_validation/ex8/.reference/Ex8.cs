// d09_options_validation / ex8 - reference solution (author only, used by `dojo verify`).

using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class PipelineOptions
{
    [Required]
    public string Name { get; set; } = "";

    [Range(1, 64)]
    public int Workers { get; set; } = 1;

    public string Mode { get; set; } = "batch";

    public string Label { get; set; } = "";
}

public record PipelineResponse(string Name, int Workers, string Mode, string Label);

public class Ex8Services : IServiceRegistrar
{
    public static readonly string[] Modes = ["batch", "stream"];

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<PipelineOptions>()
            .BindConfiguration("Dojo:D09:Pipeline")
            .PostConfigure(options =>
                options.Label = $"{options.Name}:{options.Mode}:{options.Workers}")
            .ValidateDataAnnotations()
            .Validate(options => Modes.Contains(options.Mode), "Mode must be batch or stream.");
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/pipeline", GetPipeline);
    }

    private static IResult GetPipeline(IOptions<PipelineOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new PipelineResponse(value.Name, value.Workers, value.Mode, value.Label));
}
