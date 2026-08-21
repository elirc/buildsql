// i1_interview_concepts / ex2 - "this rejection never reaches the audit log. Why?"
// See lessons/i1_interview_concepts/README.md, "Exercise 2".

namespace DotnetDojo.Api.I1_InterviewConcepts;

public interface IAuditCounter
{
    int Count { get; }

    void Record();
}

public sealed class AuditCounter : IAuditCounter
{
    private int _count;

    public int Count => Volatile.Read(ref _count);

    public void Record() => Interlocked.Increment(ref _count);
}

// Given code: records that a request happened, whatever its outcome.
public class AuditMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IAuditCounter counter)
    {
        counter.Record();
        await next(context);
    }
}

// Given code: refuses anything without an API key, and does not call next.
public class GateMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Headers["X-Api-Key"].FirstOrDefault() != "dojo-key")
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }

        return next(context);
    }
}

public record AuditCountResponse(int Count);

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAuditCounter, AuditCounter>();
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        Configure(pipeline);
        pipeline.Run(context => context.Response.WriteAsync("ok"));

        app.Map("/i1/pipeline/{**rest}", pipeline.Build());
        app.MapGet("/i1/audit-count", AuditCount);
    }

    // TODO ex2: rejected requests are not being audited. One line moves.
    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseMiddleware<GateMiddleware>();
        pipeline.UseMiddleware<AuditMiddleware>();
    }

    // Given code.
    private static IResult AuditCount(IAuditCounter counter) =>
        TypedResults.Ok(new AuditCountResponse(counter.Count));
}
