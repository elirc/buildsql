// d07_middleware_custom / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class HandledMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-D07-Handled";

    public const string ItemKey = "d07.traced";

    public Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers[HeaderName] = "yes";

        if (context.Request.Query.ContainsKey("trace"))
        {
            context.Items[ItemKey] = true;
        }

        return next(context);
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<HandledMiddleware>();

        pipeline.Run(context => context.Response.WriteAsync(
            context.Items[HandledMiddleware.ItemKey] is true ? "traced" : "plain"));

        app.Map("/d07/handled", pipeline.Build());
    }
}
