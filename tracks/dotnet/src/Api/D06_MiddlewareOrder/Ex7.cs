// d06_middleware_order / ex7 - what an exception does to the way out.
// See lessons/d06_middleware_order/README.md, "Exercise 7".

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        D06Pipeline.WriteTraceWhenDone(pipeline);
        Configure(pipeline);
        pipeline.Run(D06Pipeline.Handler);

        app.Map("/d06/errors/{**rest}", pipeline.Build());
    }

    // TODO ex7: three middlewares, and only the order is wrong. The audit
    // marker has to finish even when the request blows up, and the risky one
    // has to be somewhere its exception can be caught.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<RiskyMiddleware>();
        pipeline.UseMiddleware<CatchMiddleware>();
        pipeline.UseMiddleware<MarkMiddleware>("audit");
    }
}
