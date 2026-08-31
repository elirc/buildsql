// d06_middleware_order / ex7 - reference solution (author only, used by `dojo verify`).

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

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<MarkMiddleware>("audit");
        pipeline.UseMiddleware<CatchMiddleware>();
        pipeline.UseMiddleware<RiskyMiddleware>();
    }
}
