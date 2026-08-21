// i2_interview_drills / ex5 - "give me one place that handles failures." Time-box: 20 minutes.
// See lessons/i2_interview_drills/README.md, "Drill 5".

namespace DotnetDojo.Api.I2_InterviewDrills;

public class GuardMiddleware(RequestDelegate next, ILogger<GuardMiddleware> logger)
{
    public const string HeaderName = "X-Correlation-Id";

    // Give every request a correlation id - echoed from the request header when
    // there is one, otherwise a fresh Guid - and put it on the response.
    //
    // DrillNotFoundException -> 404 ProblemDetails whose detail is the
    //                           exception's message, logged at Warning.
    // anything else          -> 500 ProblemDetails with a generic title and no
    //                           detail, logged at Error with the exception.
    //
    // Both problem documents carry an extension member "correlationId", and
    // both log entries carry a named property CorrelationId.
    public Task InvokeAsync(HttpContext context) =>
        throw new NotImplementedException("ex5: GuardMiddleware is not implemented yet - edit src/Api/I2_InterviewDrills/Ex5.cs");
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
