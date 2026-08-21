// 03_middleware / review1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L03_Middleware;

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
    public async Task InvokeAsync(HttpContext context, IStatusLog log)
    {
        await next(context);
        log.Record(context.Response.StatusCode);
    }
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

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<StatusRecorderMiddleware>();
        pipeline.UseMiddleware<TeapotMiddleware>();
    }

    private static IResult LastStatus(IStatusLog log) =>
        TypedResults.Ok(new LastStatusResponse(log.Last));
}
