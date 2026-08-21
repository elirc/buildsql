// 00_hello_dojo / ex2 - reading the query string, and saying no.
// See lessons/00_hello_dojo/README.md, "Exercise 2".

namespace DotnetDojo.Api.L00_HelloDojo;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l00/echo", Echo);
    }

    // ?message=hi  -> 200 {"message":"hi","length":2}
    // missing or blank message -> 400, no body required.
    private static IResult Echo(string? message) =>
        throw new NotImplementedException("ex2: /l00/echo is not implemented yet - edit src/Api/L00_HelloDojo/Ex2.cs");
}

public record EchoResponse(string Message, int Length);
