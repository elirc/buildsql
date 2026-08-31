// d06_middleware_order / ex2 - where a short-circuit belongs.
// See lessons/d06_middleware_order/README.md, "Exercise 2".

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        D06Pipeline.WriteTraceWhenDone(pipeline);
        Configure(pipeline);
        pipeline.Run(D06Pipeline.Handler);

        app.Map("/d06/guard", pipeline.Build());
    }

    // TODO ex2: both of these belong in the pipeline. Only the order is wrong.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<ExpensiveMiddleware>();
        pipeline.UseMiddleware<KeyGuardMiddleware>();
    }
}
