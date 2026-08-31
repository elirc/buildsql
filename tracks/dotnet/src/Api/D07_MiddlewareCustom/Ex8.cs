// d07_middleware_custom / ex8 - one middleware that does all of it.
// See lessons/d07_middleware_custom/README.md, "Exercise 8".

namespace DotnetDojo.Api.D07_MiddlewareCustom;

/// <summary>One per request, so the middleware holding it has to be one per request too.</summary>
public interface IRecorder
{
    Guid Id { get; }
}

public sealed class Recorder : IRecorder
{
    public Guid Id { get; } = Guid.NewGuid();
}

public class RecordMiddleware(IRecorder recorder) : IMiddleware
{
    public const string RecordHeader = "X-Record";

    public const string IdHeader = "X-Record-Id";

    public const int MaxRequestChars = 20;

    // TODO ex8: see the README. Buffer the request, refuse anything too big
    // with a 413, capture the response, and report both lengths.
    public Task InvokeAsync(HttpContext context, RequestDelegate next) =>
        throw new NotImplementedException(
            "ex8: RecordMiddleware is not implemented yet - edit src/Api/D07_MiddlewareCustom/Ex8.cs");
}

public class Ex8Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IRecorder, Recorder>();

        // TODO ex8: the middleware is factory-based, so it needs registering
        // too - with the lifetime that makes the recorder above work.
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<RecordMiddleware>();

        // Given: the handler reads the body and echoes it back with a prefix.
        pipeline.Run(async context =>
        {
            using var reader = new StreamReader(context.Request.Body);
            string body = await reader.ReadToEndAsync();

            await context.Response.WriteAsync("echo:" + body);
        });

        app.Map("/d07/record/{**rest}", pipeline.Build());
    }
}
