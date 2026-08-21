// 03_middleware / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L03_Middleware;

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

        pipeline.Use(async (context, next) =>
        {
            await next(context);
            await context.Response.WriteAsync(PipelineTrace.Read(context));
        });

        Configure(pipeline);

        pipeline.Run(context =>
        {
            PipelineTrace.Mark(context, "handler");
            return Task.CompletedTask;
        });

        app.Map("/l03/order", pipeline.Build());
    }

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<CorrelationMarker>();
        pipeline.UseMiddleware<TimingMarker>();
        pipeline.UseMiddleware<AuthMarker>();
    }
}
