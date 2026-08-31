// d07_middleware_custom / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class BodyLengthMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Body-Length";

    public async Task InvokeAsync(HttpContext context)
    {
        // Makes the request body seekable, so it can be read more than once.
        context.Request.EnableBuffering();

        using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
        string body = await reader.ReadToEndAsync();

        context.Response.Headers[HeaderName] = body.Length.ToString();

        // Rewind, or the handler starts reading from the end.
        context.Request.Body.Position = 0;

        await next(context);
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<BodyLengthMiddleware>();

        pipeline.Run(async context =>
        {
            using var reader = new StreamReader(context.Request.Body);
            string body = await reader.ReadToEndAsync();

            await context.Response.WriteAsync(body);
        });

        app.Map("/d07/echo", pipeline.Build());
    }
}
