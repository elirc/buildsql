// d09_options_validation / ex3 - reference solution (author only, used by `dojo verify`).

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
        services.AddOptions<WindowOptions>()
            .BindConfiguration("Dojo:D09:Window")
            .Validate(options => options.End > options.Start, "End must be after Start.");
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d09/window", GetWindow);
    }

    private static IResult GetWindow(IOptions<WindowOptions> options) =>
        D09Options.Read(
            () => options.Value,
            value => new WindowResponse(value.Start, value.End));
}
