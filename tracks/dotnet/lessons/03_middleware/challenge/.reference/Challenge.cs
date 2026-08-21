// 03_middleware / challenge - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L03_Middleware;

public class CorrelationIdMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        string incoming = context.Request.Headers[HeaderName].FirstOrDefault() ?? "";
        context.Response.Headers[HeaderName] =
            incoming.Length > 0 ? incoming : Guid.NewGuid().ToString();

        await next(context);
    }
}

public class ChallengeApiKeyMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Api-Key";
    public const string ValidKey = "dojo-key";

    public Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Headers[HeaderName].FirstOrDefault() != ValidKey)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }

        return next(context);
    }
}

public class AdminOnlyMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Role";

    public Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Headers[HeaderName].FirstOrDefault() != "admin")
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }

        return next(context);
    }
}

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        Configure(pipeline);
        pipeline.Run(context => context.Response.WriteAsync("ok"));

        app.Map("/l03/challenge/{**rest}", pipeline.Build());
    }

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<CorrelationIdMiddleware>();
        pipeline.UseMiddleware<ChallengeApiKeyMiddleware>();
        pipeline.UseWhen(
            context => context.Request.Path.StartsWithSegments("/l03/challenge/admin"),
            admin => admin.UseMiddleware<AdminOnlyMiddleware>());
    }
}
