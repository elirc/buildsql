// 03_middleware / ex4 - Use, UseWhen and Run.
// See lessons/03_middleware/README.md, "Exercise 4".

namespace DotnetDojo.Api.L03_Middleware;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        Configure(pipeline);

        app.Map("/l03/branch/{**rest}", pipeline.Build());
    }

    // TODO ex4: build a pipeline that
    //   * adds the response header "X-Branch-Seen: all" to every request,
    //   * answers "admin" for paths under /l03/branch/admin,
    //   * answers "default" for everything else.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.Run(context => context.Response.WriteAsync("default"));
    }
}
