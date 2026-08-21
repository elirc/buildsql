// 08_errors_logging / ex4 - a failure a support ticket can point at.
// See lessons/08_errors_logging/README.md, "Exercise 4".

namespace DotnetDojo.Api.L08_ErrorsLogging;

public class CorrelatedExceptionMiddleware(
    RequestDelegate next,
    ILogger<CorrelatedExceptionMiddleware> logger)
{
    public const string HeaderName = "X-Correlation-Id";

    // Give every request a correlation id - the one the client sent in
    // X-Correlation-Id, or a fresh Guid - and put it on the response header.
    //
    // If the request throws, log it at Error with the exception and the id as a
    // named property called CorrelationId, and answer 500 with a ProblemDetails
    // carrying an extension member "correlationId" holding the same value.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException("ex4: CorrelatedExceptionMiddleware is not implemented yet - edit src/Api/L08_ErrorsLogging/Ex4.cs");
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
