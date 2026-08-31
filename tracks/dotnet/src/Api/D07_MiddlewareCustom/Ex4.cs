// d07_middleware_custom / ex4 - the middleware that says no, properly.
// See lessons/d07_middleware_custom/README.md, "Exercise 4".

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class BearerGateMiddleware(RequestDelegate next)
{
    public const string ValidToken = "Bearer d07-token";

    // TODO ex4: no Authorization header at all is a 401 carrying
    // "WWW-Authenticate: Bearer"; a header that is not ValidToken is a 403;
    // ValidToken lets the request through. Neither refusal writes a body or
    // calls next.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException(
            "ex4: BearerGateMiddleware is not implemented yet - edit src/Api/D07_MiddlewareCustom/Ex4.cs");
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<BearerGateMiddleware>();
        pipeline.Run(context => context.Response.WriteAsync("secret"));

        app.Map("/d07/vault", pipeline.Build());
    }
}
