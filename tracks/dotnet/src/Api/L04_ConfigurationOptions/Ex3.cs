// 04_configuration_options / ex3 - which environment am I, and what does configuration say?
// See lessons/04_configuration_options/README.md, "Exercise 3".

namespace DotnetDojo.Api.L04_ConfigurationOptions;

public record EnvironmentResponse(string Name, bool IsDevelopment, string CatalogTitle);

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l04/environment", GetEnvironment);
    }

    // 200 with {"name": …, "isDevelopment": …, "catalogTitle": …}.
    // The title comes straight out of IConfiguration, not out of an options class.
    private static IResult GetEnvironment(IHostEnvironment environment, IConfiguration configuration) =>
        throw new NotImplementedException("ex3: GET /l04/environment is not implemented yet - edit src/Api/L04_ConfigurationOptions/Ex3.cs");
}
