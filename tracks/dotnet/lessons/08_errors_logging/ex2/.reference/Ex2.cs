// 08_errors_logging / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L08_ErrorsLogging;

public class LoggingExceptionMiddleware(RequestDelegate next, ILogger<LoggingExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Path}", context.Request.Path.Value);

            await Results.Problem(
                    title: "An unexpected error occurred.",
                    statusCode: StatusCodes.Status500InternalServerError)
                .ExecuteAsync(context);
        }
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<LoggingExceptionMiddleware>();
        pipeline.Run(Trap.Handle);

        app.Map("/l08/logged/{**rest}", pipeline.Build());
    }
}
