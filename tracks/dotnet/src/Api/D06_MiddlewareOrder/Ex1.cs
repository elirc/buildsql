// d06_middleware_order / ex1 - the order is the design.
// See lessons/d06_middleware_order/README.md, "Exercise 1".

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        D06Pipeline.WriteTraceWhenDone(pipeline);
        Configure(pipeline);
        pipeline.Run(D06Pipeline.Handler);

        app.Map("/d06/order", pipeline.Build());
    }

    // TODO ex1: add the three markers - "timing", "auth" and "cache" - in the
    // order the README asks for.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<MarkMiddleware>("cache");
        pipeline.UseMiddleware<MarkMiddleware>("auth");
        pipeline.UseMiddleware<MarkMiddleware>("timing");
    }
}
