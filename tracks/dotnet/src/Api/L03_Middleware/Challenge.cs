// 03_middleware / challenge - a pipeline that has to be in the right order to be correct.
// See lessons/03_middleware/README.md, "Challenge".

namespace DotnetDojo.Api.L03_Middleware;

// Given code: reads an incoming X-Correlation-Id or invents one, and always
// echoes it back on the response.
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

    // 401 and stop, unless the X-Api-Key header is exactly "dojo-key".
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException("challenge: ChallengeApiKeyMiddleware is not implemented yet - edit src/Api/L03_Middleware/Challenge.cs");
}

public class AdminOnlyMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Role";

    // 403 and stop, unless the X-Role header is exactly "admin".
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException("challenge: AdminOnlyMiddleware is not implemented yet - edit src/Api/L03_Middleware/Challenge.cs");
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

    // TODO challenge: three middlewares, and only one order is correct.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<ChallengeApiKeyMiddleware>();
        pipeline.UseMiddleware<AdminOnlyMiddleware>();
        pipeline.UseMiddleware<CorrelationIdMiddleware>();
    }
}
