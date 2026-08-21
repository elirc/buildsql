// i2_interview_drills / ex2 - "write me a rate limiter." Time-box: 25 minutes.
// See lessons/i2_interview_drills/README.md, "Drill 2".

namespace DotnetDojo.Api.I2_InterviewDrills;

public class RateLimitMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Api-Key";

    public const int Limit = 3;

    // No X-Api-Key at all               -> 400, and do not call next.
    // More than Limit requests for a key -> 429 with a Retry-After header of
    //                                      "60", and do not call next.
    // Otherwise                          -> call next.
    //
    // Each key is counted separately.
    public Task InvokeAsync(HttpContext context, IRequestCounter counter) =>
        throw new NotImplementedException("ex2: RateLimitMiddleware is not implemented yet - edit src/Api/I2_InterviewDrills/Ex2.cs");
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();
        pipeline.UseMiddleware<RateLimitMiddleware>();
        pipeline.Run(context => context.Response.WriteAsync("ok"));

        app.Map("/i2/limited/{**rest}", pipeline.Build());
    }
}
