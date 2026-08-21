// i3_interview_rapidfire / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        Configure(pipeline);
        pipeline.Run(context => context.Response.WriteAsync("ok"));

        app.Map("/i3/order/{**rest}", pipeline.Build());
    }

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<SeenMiddleware>();
        pipeline.UseMiddleware<RefuseMiddleware>();
    }
}
