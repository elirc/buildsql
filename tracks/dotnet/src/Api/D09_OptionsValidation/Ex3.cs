// d09_options_validation / ex3 - a rule no attribute can express.
// See lessons/d09_options_validation/README.md, "Exercise 3".

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D09_OptionsValidation;

public class WindowOptions
{
    public int Start { get; set; }

    public int End { get; set; } = 24;
}

public record WindowResponse(int Start, int End);

public class Ex3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex3: bind "Dojo:D09:Window" and add the rule that End has to be
        // greater than Start. The message must be exactly:
        //     "End must be after Start."
        services.AddOptions<WindowOptions>();
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/window", GetWindow);
    }

    // Given: 200 with {"start": …, "end": …}, or 500 with the failures.
    private static IResult GetWindow(IOptions<WindowOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new WindowResponse(value.Start, value.End));
}
