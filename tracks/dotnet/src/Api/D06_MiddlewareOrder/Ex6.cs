// d06_middleware_order / ex6 - a header that depends on what happened later.
// See lessons/d06_middleware_order/README.md, "Exercise 6".

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class MarksHeaderMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Marks";

    public async Task InvokeAsync(HttpContext context)
    {
        // TODO ex6: nothing has happened yet, so this header is empty. Moving
        // the line below the await does not work either - by then the response
        // has started and its headers are read-only. The README names the hook
        // that does work.
        context.Response.Headers[HeaderName] = D06Trace.Read(context);

        await next(context);
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<MarksHeaderMiddleware>();
        pipeline.UseMiddleware<MarkMiddleware>("work");

        // Given: marks, then writes - so the response starts here.
        pipeline.Run(async context =>
        {
            D06Trace.Mark(context, "handler");
            await context.Response.WriteAsync("payload");
        });

        app.Map("/d06/headers", pipeline.Build());
    }
}
