// d08_configuration / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D08_Configuration;

public record ConnectionResponse(string Name, string Value);

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/connections/{name}", GetConnection);
    }

    private static IResult GetConnection(IConfiguration configuration, string name)
    {
        string? value = configuration.GetConnectionString(name);

        return string.IsNullOrEmpty(value)
            ? TypedResults.NotFound()
            : TypedResults.Ok(new ConnectionResponse(name, value));
    }
}
