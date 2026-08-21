// 08_errors_logging / challenge - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L08_ErrorsLogging;

public class FailurePolicyMiddleware(RequestDelegate next, ILogger<FailurePolicyMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        string path = context.Request.Path.Value ?? "";

        try
        {
            await next(context);
        }
        catch (NotFoundException ex)
        {
            logger.LogWarning("Not found on {Path}: {Reason}", path, ex.Message);

            await Results.Problem(
                    title: "Not Found",
                    detail: ex.Message,
                    statusCode: StatusCodes.Status404NotFound)
                .ExecuteAsync(context);
        }
        catch (ValidationFailedException ex)
        {
            logger.LogWarning("Invalid request on {Path}: {Reason}", path, ex.Message);

            await Results.ValidationProblem(
                    new Dictionary<string, string[]> { [ex.Field] = [ex.Message] })
                .ExecuteAsync(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception on {Path}", path);

            await Results.Problem(
                    title: "An unexpected error occurred.",
                    statusCode: StatusCodes.Status500InternalServerError)
                .ExecuteAsync(context);
        }
    }
}

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<FailurePolicyMiddleware>();
        pipeline.Run(Trap.Handle);

        app.Map("/l08/challenge/{**rest}", pipeline.Build());
    }
}
