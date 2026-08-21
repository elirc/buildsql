// 03_middleware / ex1 - your first middleware.
// See lessons/03_middleware/README.md, "Exercise 1".

namespace DotnetDojo.Api.L03_Middleware;

public class StampMiddleware(RequestDelegate next)
{
    // Add a response header "X-Dojo-Stamp" with the value "l03", then let the
    // rest of the pipeline run. The `next` field is the rest of the pipeline.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException("ex1: StampMiddleware is not implemented yet - edit src/Api/L03_Middleware/Ex1.cs");
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<StampMiddleware>();
        pipeline.Run(context => context.Response.WriteAsync("handler"));

        app.Map("/l03/stamp", pipeline.Build());
    }
}
