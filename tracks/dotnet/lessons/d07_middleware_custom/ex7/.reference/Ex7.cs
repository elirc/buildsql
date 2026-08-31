// d07_middleware_custom / ex7 - reference solution (author only, used by `dojo verify`).

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

    public async Task InvokeAsync(HttpContext context)
    {
        string key = context.Request.Path.Value ?? "";

        if (cache.TryGet(key, out string cached))
        {
            context.Response.Headers[HeaderName] = "HIT";

            await context.Response.WriteAsync(cached);

            return;
        }

        var real = context.Response.Body;
        using var buffer = new MemoryStream();

        try
        {
            context.Response.Body = buffer;

            await next(context);

            buffer.Position = 0;
            string written = await new StreamReader(buffer).ReadToEndAsync();

            context.Response.Body = real;
            cache.Set(key, written);
            context.Response.Headers[HeaderName] = "MISS";

            await context.Response.WriteAsync(written);
        }
        finally
        {
            context.Response.Body = real;
        }
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

        pipeline.Run(context =>
        {
            var counter = context.RequestServices.GetRequiredService<IHandlerCounter>();

            return context.Response.WriteAsync($"made {counter.Next()}");
        });

        app.Map("/d07/cache/{**rest}", pipeline.Build());
    }
}
