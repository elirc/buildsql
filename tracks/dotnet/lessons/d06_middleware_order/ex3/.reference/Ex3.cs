// d06_middleware_order / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        D06Pipeline.WriteTraceWhenDone(pipeline);
        Configure(pipeline);

        app.Map("/d06/terminal", pipeline.Build());
    }

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<MarkMiddleware>("outer");
        pipeline.UseMiddleware<MarkMiddleware>("inner");
        pipeline.Run(D06Pipeline.Handler);
    }
}
