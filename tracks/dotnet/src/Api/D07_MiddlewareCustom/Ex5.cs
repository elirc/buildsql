// d07_middleware_custom / ex5 - reading the body without stealing it.
// See lessons/d07_middleware_custom/README.md, "Exercise 5".

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class BodyLengthMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Body-Length";

    // TODO ex5: put the request body's length in the header AND leave the body
    // readable for the handler. As written, the handler gets nothing.
    public async Task InvokeAsync(HttpContext context)
    {
        using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
        string body = await reader.ReadToEndAsync();

        context.Response.Headers[HeaderName] = body.Length.ToString();

        await next(context);
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<BodyLengthMiddleware>();

        // Given: the handler reads the body and echoes it back.
        pipeline.Run(async context =>
        {
            using var reader = new StreamReader(context.Request.Body);
            string body = await reader.ReadToEndAsync();

            await context.Response.WriteAsync(body);
        });

        app.Map("/d07/echo", pipeline.Build());
    }
}
