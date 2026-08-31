// d07_middleware_custom / ex3 - factory-based middleware, and why it exists.
// See lessons/d07_middleware_custom/README.md, "Exercise 3".

namespace DotnetDojo.Api.D07_MiddlewareCustom;

/// <summary>One per request. A convention-based middleware could never hold one.</summary>
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

    // TODO ex3: put this request's tag in the header, then call next.
    public Task InvokeAsync(HttpContext context, RequestDelegate next) =>
        throw new NotImplementedException(
            "ex3: TagMiddleware is not implemented yet - edit src/Api/D07_MiddlewareCustom/Ex3.cs");
}

public class Ex3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IRequestTag, RequestTag>();

        // TODO ex3: a factory-based middleware is resolved from the container
        // on every request, which means it has to be registered in it.
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<TagMiddleware>();

        // Given: the handler asks the request's own scope for the same service.
        pipeline.Run(context => context.Response.WriteAsync(
            context.RequestServices.GetRequiredService<IRequestTag>().Id.ToString()));

        app.Map("/d07/tag", pipeline.Build());
    }
}
