// 08_errors_logging / challenge - the whole failure policy in one middleware.
// See lessons/08_errors_logging/README.md, "Challenge".

namespace DotnetDojo.Api.L08_ErrorsLogging;

public class FailurePolicyMiddleware(RequestDelegate next, ILogger<FailurePolicyMiddleware> logger)
{
    // One place that decides, for every exception the application can throw,
    // what the client sees and what the operator sees.
    //
    //   NotFoundException         -> 404 ProblemDetails, logged at Warning
    //   ValidationFailedException -> 400 validation problem whose "errors"
    //                                object is keyed by the exception's Field,
    //                                logged at Warning
    //   anything else             -> 500 ProblemDetails with no detail,
    //                                logged at Error with the exception attached
    //
    // Every log entry carries the request path as a named property called Path.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException("challenge: FailurePolicyMiddleware is not implemented yet - edit src/Api/L08_ErrorsLogging/Challenge.cs");
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
