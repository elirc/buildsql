// 08_errors_logging / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L08_ErrorsLogging;

public class CorrelatedExceptionMiddleware(
    RequestDelegate next,
    ILogger<CorrelatedExceptionMiddleware> logger)
{
    public const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        string incoming = context.Request.Headers[HeaderName].FirstOrDefault() ?? "";
        string correlationId = incoming.Length > 0 ? incoming : Guid.NewGuid().ToString();
        context.Response.Headers[HeaderName] = correlationId;

        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception, correlation {CorrelationId}", correlationId);

            await Results.Problem(
                    title: "An unexpected error occurred.",
                    statusCode: StatusCodes.Status500InternalServerError,
                    extensions: new Dictionary<string, object?> { ["correlationId"] = correlationId })
                .ExecuteAsync(context);
        }
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<CorrelatedExceptionMiddleware>();
        pipeline.Run(Trap.Handle);

        app.Map("/l08/traced/{**rest}", pipeline.Build());
    }
}
