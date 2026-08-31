// d06_middleware_order / ex4 - a branch that rejoins.
// See lessons/d06_middleware_order/README.md, "Exercise 4".

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

    // TODO ex4: the "admin" marker must run only for paths under
    // /d06/when/admin, and the "common" marker must run for everything - and
    // both kinds of request still have to reach the terminal handler.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<MarkMiddleware>("common");
    }
}
