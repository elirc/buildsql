// 00_hello_dojo / ex3 - reading a JSON request body.
// See lessons/00_hello_dojo/README.md, "Exercise 3".

namespace DotnetDojo.Api.L00_HelloDojo;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l00/greetings", Greet);
    }

    // {"name":"Ada"} -> 200 {"greeting":"Hello, Ada!"}
    // a missing, empty or whitespace-only name -> 400.
    private static IResult Greet(GreetingRequest request) =>
        throw new NotImplementedException("ex3: /l00/greetings is not implemented yet - edit src/Api/L00_HelloDojo/Ex3.cs");
}

public record GreetingRequest(string? Name);

public record GreetingResponse(string Greeting);
