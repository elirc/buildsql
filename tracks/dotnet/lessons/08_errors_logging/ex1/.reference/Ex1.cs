// 08_errors_logging / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L08_ErrorsLogging;

public class ProblemDetailsMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (NotFoundException ex)
        {
            await Results.Problem(
                    title: "Not Found",
                    detail: ex.Message,
                    statusCode: StatusCodes.Status404NotFound)
                .ExecuteAsync(context);
        }
        catch (ValidationFailedException ex)
        {
            await Results.Problem(
                    title: "Bad Request",
                    detail: ex.Message,
                    statusCode: StatusCodes.Status400BadRequest)
                .ExecuteAsync(context);
        }
        catch (Exception)
        {
            await Results.Problem(
                    title: "An unexpected error occurred.",
                    statusCode: StatusCodes.Status500InternalServerError)
                .ExecuteAsync(context);
        }
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<ProblemDetailsMiddleware>();
        pipeline.Run(Trap.Handle);

        app.Map("/l08/mapped/{**rest}", pipeline.Build());
    }
}
