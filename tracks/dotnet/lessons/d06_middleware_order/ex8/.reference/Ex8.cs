// d06_middleware_order / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class FullMarksHeaderMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Marks";

    public Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = D06Trace.Read(context);

            return Task.CompletedTask;
        });

        return next(context);
    }
}

public class FullGuardMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        D06Trace.Mark(context, "guard>");

        if (context.Request.Headers[KeyGuardMiddleware.HeaderName] != KeyGuardMiddleware.ValidKey)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("no key");

            return;
        }

        await next(context);
        D06Trace.Mark(context, "guard<");
    }
}

public class FullCatchMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        D06Trace.Mark(context, "catch>");

        try
        {
            await next(context);
        }
        catch (InvalidOperationException)
        {
            D06Trace.Mark(context, "caught");
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsync("failed");
        }
        finally
        {
            D06Trace.Mark(context, "catch<");
        }
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        Configure(pipeline);

        pipeline.Run(async context =>
        {
            D06Trace.Mark(context, "handler");

            if ((context.Request.Path.Value ?? "").EndsWith("/boom", StringComparison.Ordinal))
            {
                throw new InvalidOperationException("handler failed");
            }

            await context.Response.WriteAsync("ok");
        });

        app.Map("/d06/full/{**rest}", pipeline.Build());
    }

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<FullMarksHeaderMiddleware>();
        pipeline.UseMiddleware<FullCatchMiddleware>();
        pipeline.UseMiddleware<FullGuardMiddleware>();

        pipeline.UseWhen(
            context => context.Request.Path.StartsWithSegments("/d06/full/admin"),
            branch => branch.UseMiddleware<MarkMiddleware>("admin"));
    }
}
