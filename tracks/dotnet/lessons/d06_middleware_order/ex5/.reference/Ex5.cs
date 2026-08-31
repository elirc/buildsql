// d06_middleware_order / ex5 - reference solution (author only, used by `dojo verify`).

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

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.MapWhen(
            context => context.Request.Query.ContainsKey("beta"),
            branch =>
            {
                branch.UseMiddleware<MarkMiddleware>("beta");
                branch.Run(context =>
                {
                    D06Trace.Mark(context, "beta-handler");

                    return Task.CompletedTask;
                });
            });

        pipeline.UseMiddleware<MarkMiddleware>("common");
    }
}
