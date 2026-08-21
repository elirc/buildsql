// 03_middleware / ex3 - short-circuiting: the middleware that says no.
// See lessons/03_middleware/README.md, "Exercise 3".

namespace DotnetDojo.Api.L03_Middleware;

public class ApiKeyMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Api-Key";
    public const string ValidKey = "dojo-key";

    // Let the request through only when the X-Api-Key header is exactly
    // "dojo-key". Otherwise answer 401 and do not call next.
    public Task InvokeAsync(HttpContext context) => next(context);
}

// Given code: proves whether anything downstream of the key check ran.
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
