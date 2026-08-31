// d07_middleware_custom / ex2 - one middleware type, two configurations.
// See lessons/d07_middleware_custom/README.md, "Exercise 2".

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class BannerMiddleware(RequestDelegate next, string headerName, string value)
{
    // TODO ex2: set the named response header to the given value, then call next.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException(
            "ex2: BannerMiddleware is not implemented yet - edit src/Api/D07_MiddlewareCustom/Ex2.cs");
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

        // TODO ex2: add BannerMiddleware here, configured with headerName and
        // value. UseMiddleware takes constructor arguments after the type.

        pipeline.Run(context => context.Response.WriteAsync("banner"));

        return pipeline.Build();
    }
}
