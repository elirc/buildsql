// d06_middleware_order / ex3 - Run is the end of the line.
// See lessons/d06_middleware_order/README.md, "Exercise 3".

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

    // TODO ex3: all three lines are needed and exactly one of them can be
    // last. Run the trace as shipped and read what comes back.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.Run(D06Pipeline.Handler);
        pipeline.UseMiddleware<MarkMiddleware>("outer");
        pipeline.UseMiddleware<MarkMiddleware>("inner");
    }
}
