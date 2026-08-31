// d06_middleware_order / ex5 - a branch that does not rejoin.
// See lessons/d06_middleware_order/README.md, "Exercise 5".

namespace DotnetDojo.Api.D06_MiddlewareOrder;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        D06Pipeline.WriteTraceWhenDone(pipeline);
        Configure(pipeline);
        pipeline.Run(D06Pipeline.Handler);

        app.Map("/d06/beta/{**rest}", pipeline.Build());
    }

    // TODO ex5: a request carrying ?beta must go down a branch that marks
    // "beta" and ends in its own terminal handler marking "beta-handler" -
    // never reaching "common" or the shared handler below. Everything else is
    // unaffected.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<MarkMiddleware>("common");
    }
}
