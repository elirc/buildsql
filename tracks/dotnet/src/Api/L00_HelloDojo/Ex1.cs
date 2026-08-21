// 00_hello_dojo / ex1 - your first endpoint.
// See lessons/00_hello_dojo/README.md, "Exercise 1".

namespace DotnetDojo.Api.L00_HelloDojo;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l00/ping", Ping);
    }

    // Return 200 with a body of {"status":"ok","lesson":"00_hello_dojo"}.
    private static IResult Ping() =>
        throw new NotImplementedException("ex1: /l00/ping is not implemented yet - edit src/Api/L00_HelloDojo/Ex1.cs");
}

public record PingResponse(string Status, string Lesson);
