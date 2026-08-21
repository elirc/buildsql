// 03_middleware / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L03_Middleware;

public class ApiKeyMiddleware(RequestDelegate next)
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

public class ReachedHandlerMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers["X-Reached-Handler"] = "yes";
        return next(context);
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<ApiKeyMiddleware>();
        pipeline.UseMiddleware<ReachedHandlerMiddleware>();
        pipeline.Run(context => context.Response.WriteAsync("secret"));

        app.Map("/l03/secure", pipeline.Build());
    }
}
