// d06_middleware_order / ex8 - the whole pipeline, assembled.
// See lessons/d06_middleware_order/README.md, "Exercise 8".

namespace DotnetDojo.Api.D06_MiddlewareOrder;

// Given: ex6's answer, so this exercise is only about order.
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

// Given: like ex2's guard, but it writes a body so the response always starts.
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

// Given: like ex7's catcher, but it writes a body too.
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

        // Given: the terminal handler. Marks, then either throws or answers.
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

    // TODO ex8: four things, in the one order that satisfies the README.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<FullMarksHeaderMiddleware>();
    }
}
