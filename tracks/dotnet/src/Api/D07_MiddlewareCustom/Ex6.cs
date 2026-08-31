// d07_middleware_custom / ex6 - capturing what the pipeline wrote.
// See lessons/d07_middleware_custom/README.md, "Exercise 6".

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class ShoutMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Original-Length";

    // TODO ex6: capture everything the rest of the pipeline writes, report its
    // length in the header, and send the SHOUTED version to the real client.
    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers[HeaderName] = "0";

        await next(context);
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<ShoutMiddleware>();
        pipeline.Run(context => context.Response.WriteAsync("hello from the handler"));

        app.Map("/d07/shout", pipeline.Build());
    }
}
