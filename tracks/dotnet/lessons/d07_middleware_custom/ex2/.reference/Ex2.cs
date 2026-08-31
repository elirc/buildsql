// d07_middleware_custom / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class BannerMiddleware(RequestDelegate next, string headerName, string value)
{
    public Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers[headerName] = value;

        return next(context);
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.Map("/d07/banner/a", Branch(app, "X-Banner", "alpha"));
        app.Map("/d07/banner/b", Branch(app, "X-Banner", "beta"));
    }

    private static RequestDelegate Branch(
        IEndpointRouteBuilder app, string headerName, string value)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<BannerMiddleware>(headerName, value);

        pipeline.Run(context => context.Response.WriteAsync("banner"));

        return pipeline.Build();
    }
}
