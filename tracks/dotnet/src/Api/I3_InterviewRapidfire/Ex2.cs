// i3_interview_rapidfire / ex2 - order, cold.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 2".

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

    // TODO ex2: the rejected request comes back without the X-Seen header.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<RefuseMiddleware>();
        pipeline.UseMiddleware<SeenMiddleware>();
    }
}
