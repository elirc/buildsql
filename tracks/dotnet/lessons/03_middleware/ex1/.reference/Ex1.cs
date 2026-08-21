// 03_middleware / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L03_Middleware;

public class StampMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers["X-Dojo-Stamp"] = "l03";
        return next(context);
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<StampMiddleware>();
        pipeline.Run(context => context.Response.WriteAsync("handler"));

        app.Map("/l03/stamp", pipeline.Build());
    }
}
