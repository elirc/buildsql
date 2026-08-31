// d06_middleware_order - given code, not an exercise. Read it, do not edit it.
//
// A per-request scratchpad and the middleware types the eight ordering drills
// arrange. Every exercise builds its own pipeline with
// app.CreateApplicationBuilder() and hangs it off one path, so no two
// exercises can interfere with each other.

namespace DotnetDojo.Api.D06_MiddlewareOrder;

/// <summary>A list of marks that lives for exactly one request.</summary>
public static class D06Trace
{
    private const string Key = "d06.trace";

    public static void Mark(HttpContext context, string mark)
    {
        if (context.Items[Key] is not List<string> marks)
        {
            marks = [];
            context.Items[Key] = marks;
        }

        marks.Add(mark);
    }

    public static string Read(HttpContext context) =>
        context.Items[Key] is List<string> marks ? string.Join(",", marks) : "";
}

/// <summary>Marks "name&gt;" on the way in and "name&lt;" on the way out.</summary>
public class MarkMiddleware(RequestDelegate next, string name)
{
    public async Task InvokeAsync(HttpContext context)
    {
        D06Trace.Mark(context, name + ">");
        await next(context);
        D06Trace.Mark(context, name + "<");
    }
}

/// <summary>Refuses anything without the right key, and does not call next.</summary>
public class KeyGuardMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Key";

    public const string ValidKey = "d06-key";

    public async Task InvokeAsync(HttpContext context)
    {
        D06Trace.Mark(context, "guard>");

        if (context.Request.Headers[HeaderName] != ValidKey)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;

            return;
        }

        await next(context);
        D06Trace.Mark(context, "guard<");
    }
}

/// <summary>Pretends to do something costly. It should never run for a rejected request.</summary>
public class ExpensiveMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        D06Trace.Mark(context, "expensive>");
        await next(context);
        D06Trace.Mark(context, "expensive<");
    }
}

/// <summary>Marks, then throws when the path ends with /boom.</summary>
public class RiskyMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context)
    {
        D06Trace.Mark(context, "risky");

        if ((context.Request.Path.Value ?? "").EndsWith("/boom", StringComparison.Ordinal))
        {
            throw new InvalidOperationException("risky failed");
        }

        return next(context);
    }
}

/// <summary>Turns an InvalidOperationException from downstream into a 503.</summary>
public class CatchMiddleware(RequestDelegate next)
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
        }
        finally
        {
            D06Trace.Mark(context, "catch<");
        }
    }
}

public static class D06Pipeline
{
    /// <summary>The outermost middleware every drill shares: it answers with the trace.</summary>
    public static void WriteTraceWhenDone(IApplicationBuilder pipeline) =>
        pipeline.Use(async (context, next) =>
        {
            await next(context);
            await context.Response.WriteAsync(D06Trace.Read(context));
        });

    /// <summary>The terminal handler every drill shares: marks and writes nothing.</summary>
    public static Task Handler(HttpContext context)
    {
        D06Trace.Mark(context, "handler");

        return Task.CompletedTask;
    }
}
