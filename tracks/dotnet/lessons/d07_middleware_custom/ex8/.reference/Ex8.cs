// d07_middleware_custom / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D07_MiddlewareCustom;

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

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        context.Response.Headers[IdHeader] = recorder.Id.ToString();

        context.Request.EnableBuffering();

        using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
        string request = await reader.ReadToEndAsync();
        context.Request.Body.Position = 0;

        if (request.Length > MaxRequestChars)
        {
            context.Response.StatusCode = StatusCodes.Status413PayloadTooLarge;
            context.Response.Headers[RecordHeader] = $"{request.Length}:9";

            await context.Response.WriteAsync("too large");

            return;
        }

        var real = context.Response.Body;
        using var buffer = new MemoryStream();

        try
        {
            context.Response.Body = buffer;

            await next(context);

            buffer.Position = 0;
            string response = await new StreamReader(buffer).ReadToEndAsync();

            context.Response.Body = real;
            context.Response.Headers[RecordHeader] = $"{request.Length}:{response.Length}";

            await context.Response.WriteAsync(response);
        }
        finally
        {
            context.Response.Body = real;
        }
    }
}

public class Ex8Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IRecorder, Recorder>();

        services.AddScoped<RecordMiddleware>();
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        pipeline.UseMiddleware<RecordMiddleware>();

        pipeline.Run(async context =>
        {
            using var reader = new StreamReader(context.Request.Body);
            string body = await reader.ReadToEndAsync();

            await context.Response.WriteAsync("echo:" + body);
        });

        app.Map("/d07/record/{**rest}", pipeline.Build());
    }
}
