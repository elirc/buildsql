// 03_middleware / review1 - spaced-review variant: what the outermost middleware can see.
// See lessons/03_middleware/README.md, "Review".

namespace DotnetDojo.Api.L03_Middleware;

/// <summary>Remembers the status code of the last request through the pipeline. Given code.</summary>
public interface IStatusLog
{
    int Last { get; }

    void Record(int statusCode);
}

public sealed class StatusLog : IStatusLog
{
    private int _last;

    public int Last => Volatile.Read(ref _last);

    public void Record(int statusCode) => Volatile.Write(ref _last, statusCode);
}

// Given code: refuses to brew coffee, and does not call next when it refuses.
public class TeapotMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.Value?.EndsWith("/teapot", StringComparison.Ordinal) == true)
        {
            context.Response.StatusCode = StatusCodes.Status418ImATeapot;
            return;
        }

        await next(context);
    }
}

public class StatusRecorderMiddleware(RequestDelegate next)
{
    // Record the status code the response ended up with. Note that you can
    // only know it after the rest of the pipeline has finished.
    public Task InvokeAsync(HttpContext context, IStatusLog log) =>
        throw new NotImplementedException("review1: StatusRecorderMiddleware is not implemented yet - edit src/Api/L03_Middleware/Review1.cs");
}

public class Review1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IStatusLog, StatusLog>();
    }
}

public record LastStatusResponse(int Status);

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        Configure(pipeline);
        pipeline.Run(context => context.Response.WriteAsync("ok"));

        app.Map("/l03/review/pipeline/{**rest}", pipeline.Build());
        app.MapGet("/l03/review/last-status", LastStatus);
    }

    // TODO review1: one of these two has to be able to see what the other did.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<TeapotMiddleware>();
        pipeline.UseMiddleware<StatusRecorderMiddleware>();
    }

    // Given code.
    private static IResult LastStatus(IStatusLog log) =>
        TypedResults.Ok(new LastStatusResponse(log.Last));
}
