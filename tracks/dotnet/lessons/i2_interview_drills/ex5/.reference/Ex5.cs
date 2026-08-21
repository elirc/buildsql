// i2_interview_drills / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I2_InterviewDrills;

public class GuardMiddleware(RequestDelegate next, ILogger<GuardMiddleware> logger)
{
    public const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        string incoming = context.Request.Headers[HeaderName].FirstOrDefault() ?? "";
        string correlationId = incoming.Length > 0 ? incoming : Guid.NewGuid().ToString();
        context.Response.Headers[HeaderName] = correlationId;

        var extensions = new Dictionary<string, object?> { ["correlationId"] = correlationId };

        try
        {
            await next(context);
        }
        catch (DrillNotFoundException ex)
        {
            logger.LogWarning(
                "Not found on {Path}, correlation {CorrelationId}",
                context.Request.Path.Value,
                correlationId);

            await Results.Problem(
                    title: "Not Found",
                    detail: ex.Message,
                    statusCode: StatusCodes.Status404NotFound,
                    extensions: extensions)
                .ExecuteAsync(context);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Unhandled exception on {Path}, correlation {CorrelationId}",
                context.Request.Path.Value,
                correlationId);

            await Results.Problem(
                    title: "An unexpected error occurred.",
                    statusCode: StatusCodes.Status500InternalServerError,
                    extensions: extensions)
                .ExecuteAsync(context);
        }
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<GuardMiddleware>();
        pipeline.Run(DrillTrap.Handle);

        app.Map("/i2/guard/{**rest}", pipeline.Build());
    }
}
