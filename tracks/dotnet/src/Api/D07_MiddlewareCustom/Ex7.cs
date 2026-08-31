// d07_middleware_custom / ex7 - a cache that answers instead of the handler.
// See lessons/d07_middleware_custom/README.md, "Exercise 7".

using System.Collections.Concurrent;

namespace DotnetDojo.Api.D07_MiddlewareCustom;

public interface IResponseCache
{
    bool TryGet(string key, out string body);

    void Set(string key, string body);
}

public sealed class ResponseCache : IResponseCache
{
    private readonly ConcurrentDictionary<string, string> _entries = new();

    public bool TryGet(string key, out string body) => _entries.TryGetValue(key, out body!);

    public void Set(string key, string body) => _entries[key] = body;
}

public interface IHandlerCounter
{
    int Next();
}

public sealed class HandlerCounter : IHandlerCounter
{
    private int _count;

    public int Next() => Interlocked.Increment(ref _count);
}

public class CacheMiddleware(RequestDelegate next, IResponseCache cache)
{
    public const string HeaderName = "X-Cache";

    // TODO ex7: on a hit, answer from the cache with "X-Cache: HIT" and do not
    // call next. On a miss, capture what the pipeline writes, store it under
    // the request path, mark "X-Cache: MISS" and send it on.
    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers[HeaderName] = "MISS";

        await next(context);
    }
}

public class Ex7Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IResponseCache, ResponseCache>();
        services.AddSingleton<IHandlerCounter, HandlerCounter>();
    }
}

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<CacheMiddleware>();

        // Given: an expensive handler. Every run produces a different answer,
        // so a cached response is easy to tell from a fresh one.
        pipeline.Run(context =>
        {
            var counter = context.RequestServices.GetRequiredService<IHandlerCounter>();

            return context.Response.WriteAsync($"made {counter.Next()}");
        });

        app.Map("/d07/cache/{**rest}", pipeline.Build());
    }
}
