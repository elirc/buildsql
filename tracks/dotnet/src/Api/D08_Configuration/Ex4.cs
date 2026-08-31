// d08_configuration / ex4 - connection strings have their own accessor.
// See lessons/d08_configuration/README.md, "Exercise 4".

namespace DotnetDojo.Api.D08_Configuration;

public record ConnectionResponse(string Name, string Value);

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/connections/{name}", GetConnection);
    }

    // 200 with {"name": …, "value": …} for a connection string this
    // application has been configured with, 404 for one it has not.
    private static IResult GetConnection(IConfiguration configuration, string name) =>
        throw new NotImplementedException(
            "ex4: GET /d08/connections/{name} is not implemented yet - edit src/Api/D08_Configuration/Ex4.cs");
}
