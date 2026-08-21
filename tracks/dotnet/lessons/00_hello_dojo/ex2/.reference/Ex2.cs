// 00_hello_dojo / ex2 - reference solution (author only, used by `dojo verify`).
// Overlaid onto src/Api/L00_HelloDojo/Ex2.cs during verification.

namespace DotnetDojo.Api.L00_HelloDojo;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l00/echo", Echo);
    }

    private static IResult Echo(string? message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return TypedResults.BadRequest();
        }

        return TypedResults.Ok(new EchoResponse(message, message.Length));
    }
}

public record EchoResponse(string Message, int Length);
