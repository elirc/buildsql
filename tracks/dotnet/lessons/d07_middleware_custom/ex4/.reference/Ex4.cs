// d07_middleware_custom / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class BearerGateMiddleware(RequestDelegate next)
{
    public const string ValidToken = "Bearer d07-token";

    public Task InvokeAsync(HttpContext context)
    {
        string authorization = context.Request.Headers.Authorization.ToString();

        if (string.IsNullOrWhiteSpace(authorization))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.Headers.WWWAuthenticate = "Bearer";

            return Task.CompletedTask;
        }

        if (authorization != ValidToken)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;

            return Task.CompletedTask;
        }

        return next(context);
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<BearerGateMiddleware>();
        pipeline.Run(context => context.Response.WriteAsync("secret"));

        app.Map("/d07/vault", pipeline.Build());
    }
}
