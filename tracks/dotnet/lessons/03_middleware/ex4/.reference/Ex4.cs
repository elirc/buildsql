// 03_middleware / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L03_Middleware;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        Configure(pipeline);

        app.Map("/l03/branch/{**rest}", pipeline.Build());
    }

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.Use(async (context, next) =>
        {
            context.Response.Headers["X-Branch-Seen"] = "all";
            await next(context);
        });

        pipeline.UseWhen(
            context => context.Request.Path.StartsWithSegments("/l03/branch/admin"),
            admin => admin.Run(context => context.Response.WriteAsync("admin")));

        pipeline.Run(context => context.Response.WriteAsync("default"));
    }
}
