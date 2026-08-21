// 08_errors_logging / ex2 - log the detail, return the generic.
// See lessons/08_errors_logging/README.md, "Exercise 2".

namespace DotnetDojo.Api.L08_ErrorsLogging;

public class LoggingExceptionMiddleware(RequestDelegate next, ILogger<LoggingExceptionMiddleware> logger)
{
    // On an unhandled exception:
    //   * log it at Error, with the exception object itself passed to the
    //     logger and the request path as a named property called Path;
    //   * answer 500 with a ProblemDetails whose title is
    //     "An unexpected error occurred." and which says nothing else.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException("ex2: LoggingExceptionMiddleware is not implemented yet - edit src/Api/L08_ErrorsLogging/Ex2.cs");
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
