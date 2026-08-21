// 04_configuration_options / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L04_ConfigurationOptions;

public record EnvironmentResponse(string Name, bool IsDevelopment, string CatalogTitle);

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/environment", GetEnvironment);
    }

    private static IResult GetEnvironment(IHostEnvironment environment, IConfiguration configuration) =>
        TypedResults.Ok(new EnvironmentResponse(
            environment.EnvironmentName,
            environment.IsDevelopment(),
            configuration["Dojo:Catalog:Title"] ?? ""));
}
