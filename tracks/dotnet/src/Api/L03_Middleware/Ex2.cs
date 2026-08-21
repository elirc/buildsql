// 03_middleware / ex2 - the order is the design.
// See lessons/03_middleware/README.md, "Exercise 2".

namespace DotnetDojo.Api.L03_Middleware;

// The three middlewares below are given code. Each one marks the trace on the
// way in and again on the way out, so the finished trace shows the shape of
// the pipeline. Do not edit them - only Ex2.Configure below.

public class CorrelationMarker(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        PipelineTrace.Mark(context, "correlation>");
        await next(context);
        PipelineTrace.Mark(context, "correlation<");
    }
}

public class TimingMarker(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        PipelineTrace.Mark(context, "timing>");
        await next(context);
        PipelineTrace.Mark(context, "timing<");
    }
}

public class AuthMarker(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        PipelineTrace.Mark(context, "auth>");
        await next(context);
        PipelineTrace.Mark(context, "auth<");
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        // Given: the outermost middleware waits for everything else to finish
        // and then writes the finished trace as the response body.
        pipeline.Use(async (context, next) =>
        {
            await next(context);
            await context.Response.WriteAsync(PipelineTrace.Read(context));
        });

        Configure(pipeline);

        // Given: the terminal handler. It marks the trace and writes nothing.
        pipeline.Run(context =>
        {
            PipelineTrace.Mark(context, "handler");
            return Task.CompletedTask;
        });

        app.Map("/l03/order", pipeline.Build());
    }

    // TODO ex2: add the three markers in the order the README asks for.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<AuthMarker>();
        pipeline.UseMiddleware<CorrelationMarker>();
        pipeline.UseMiddleware<TimingMarker>();
    }
}
