// 00_hello_dojo / ex3 - reference solution (author only, used by `dojo verify`).
// Overlaid onto src/Api/L00_HelloDojo/Ex3.cs during verification.

namespace DotnetDojo.Api.L00_HelloDojo;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l00/greetings", Greet);
    }

    private static IResult Greet(GreetingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return TypedResults.BadRequest();
        }

        return TypedResults.Ok(new GreetingResponse($"Hello, {request.Name}!"));
    }
}

public record GreetingRequest(string? Name);

public record GreetingResponse(string Greeting);
