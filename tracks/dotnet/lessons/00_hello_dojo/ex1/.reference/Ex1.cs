// 00_hello_dojo / ex1 - reference solution (author only, used by `dojo verify`).
// Overlaid onto src/Api/L00_HelloDojo/Ex1.cs during verification.

namespace DotnetDojo.Api.L00_HelloDojo;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l00/ping", Ping);
    }

    private static IResult Ping() =>
        TypedResults.Ok(new PingResponse("ok", "00_hello_dojo"));
}

public record PingResponse(string Status, string Lesson);
