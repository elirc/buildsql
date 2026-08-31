// d06_middleware_order / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        D06Pipeline.WriteTraceWhenDone(pipeline);
        Configure(pipeline);
        pipeline.Run(D06Pipeline.Handler);

        app.Map("/d06/when/{**rest}", pipeline.Build());
    }

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseWhen(
            context => context.Request.Path.StartsWithSegments("/d06/when/admin"),
            branch => branch.UseMiddleware<MarkMiddleware>("admin"));

        pipeline.UseMiddleware<MarkMiddleware>("common");
    }
}
