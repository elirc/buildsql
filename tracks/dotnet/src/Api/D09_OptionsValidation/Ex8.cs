// d09_options_validation / ex8 - bind, derive, validate twice.
// See lessons/d09_options_validation/README.md, "Exercise 8".

using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class PipelineOptions
{
    // TODO ex8: Name is required; Workers must be between 1 and 64.
    public string Name { get; set; } = "";

    public int Workers { get; set; } = 1;

    public string Mode { get; set; } = "batch";

    /// <summary>Derived, never configured.</summary>
    public string Label { get; set; } = "";
}

public record PipelineResponse(string Name, int Workers, string Mode, string Label);

public class Ex8Services : IServiceRegistrar
{
    public static readonly string[] Modes = ["batch", "stream"];

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex8: bind "Dojo:D09:Pipeline", derive Label as
        // "{Name}:{Mode}:{Workers}", run the annotations above, and add the
        // rule that Mode must be one of Modes, with the message:
        //     "Mode must be batch or stream."
        services.AddOptions<PipelineOptions>();
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/pipeline", GetPipeline);
    }

    // Given: 200 with {"name": …, "workers": …, "mode": …, "label": …}, or 500
    // with every failure.
    private static IResult GetPipeline(IOptions<PipelineOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new PipelineResponse(value.Name, value.Workers, value.Mode, value.Label));
}
