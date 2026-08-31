// d07_middleware_custom / ex1 - the convention-based middleware class.
// See lessons/d07_middleware_custom/README.md, "Exercise 1".

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class HandledMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-D07-Handled";

    public const string ItemKey = "d07.traced";

    // TODO ex1: add the response header "X-D07-Handled: yes"; put `true` in
    // HttpContext.Items under ItemKey when the query string has "trace"; then
    // let the rest of the pipeline run.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException(
            "ex1: HandledMiddleware is not implemented yet - edit src/Api/D07_MiddlewareCustom/Ex1.cs");
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<HandledMiddleware>();

        // Given: the terminal handler reads what the middleware left behind.
        pipeline.Run(context => context.Response.WriteAsync(
            context.Items[HandledMiddleware.ItemKey] is true ? "traced" : "plain"));

        app.Map("/d07/handled", pipeline.Build());
    }
}
