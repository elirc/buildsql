// d07_middleware_custom / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public class ShoutMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Original-Length";

    public async Task InvokeAsync(HttpContext context)
    {
        var real = context.Response.Body;
        using var buffer = new MemoryStream();

        try
        {
            context.Response.Body = buffer;

            await next(context);

            buffer.Position = 0;
            string written = await new StreamReader(buffer).ReadToEndAsync();

            context.Response.Body = real;
            context.Response.Headers[HeaderName] = written.Length.ToString();

            await context.Response.WriteAsync(written.ToUpperInvariant());
        }
        finally
        {
            context.Response.Body = real;
        }
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<ShoutMiddleware>();
        pipeline.Run(context => context.Response.WriteAsync("hello from the handler"));

        app.Map("/d07/shout", pipeline.Build());
    }
}
