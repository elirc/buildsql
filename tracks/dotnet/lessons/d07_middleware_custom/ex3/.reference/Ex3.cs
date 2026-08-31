// d07_middleware_custom / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public interface IRequestTag
{
    Guid Id { get; }
}

public sealed class RequestTag : IRequestTag
{
    public Guid Id { get; } = Guid.NewGuid();
}

public class TagMiddleware(IRequestTag tag) : IMiddleware
{
    public const string HeaderName = "X-Tag";

    public Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        context.Response.Headers[HeaderName] = tag.Id.ToString();

        return next(context);
    }
}

public class Ex3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IRequestTag, RequestTag>();

        // Scoped, so the middleware is built once per request and can hold a
        // service that is also once per request.
        services.AddScoped<TagMiddleware>();
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<TagMiddleware>();

        pipeline.Run(context => context.Response.WriteAsync(
            context.RequestServices.GetRequiredService<IRequestTag>().Id.ToString()));

        app.Map("/d07/tag", pipeline.Build());
    }
}
