// 08_errors_logging / ex1 - one middleware, one ProblemDetails per exception type.
// See lessons/08_errors_logging/README.md, "Exercise 1".

namespace DotnetDojo.Api.L08_ErrorsLogging;

public class ProblemDetailsMiddleware(RequestDelegate next)
{
    // Let the request through. If it throws:
    //   NotFoundException          -> 404, detail = the exception's message
    //   ValidationFailedException  -> 400, detail = the exception's message
    //   anything else              -> 500, title "An unexpected error occurred."
    //                                 and NO detail at all
    // Every one of those is a ProblemDetails document.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException("ex1: ProblemDetailsMiddleware is not implemented yet - edit src/Api/L08_ErrorsLogging/Ex1.cs");
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
