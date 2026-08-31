// d06_middleware_order / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class MarksHeaderMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Marks";

    public Task InvokeAsync(HttpContext context)
    {
        // Registered now, run at the moment the response starts - which is the
        // last instant the headers are still writable.
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = D06Trace.Read(context);

            return Task.CompletedTask;
        });

        return next(context);
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<MarksHeaderMiddleware>();
        pipeline.UseMiddleware<MarkMiddleware>("work");

        pipeline.Run(async context =>
        {
            D06Trace.Mark(context, "handler");
            await context.Response.WriteAsync("payload");
        });

        app.Map("/d06/headers", pipeline.Build());
    }
}
