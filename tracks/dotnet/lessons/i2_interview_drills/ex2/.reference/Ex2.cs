// i2_interview_drills / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I2_InterviewDrills;

public class RateLimitMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Api-Key";

    public const int Limit = 3;

    public Task InvokeAsync(HttpContext context, IRequestCounter counter)
    {
        string key = context.Request.Headers[HeaderName].FirstOrDefault() ?? "";

        if (key.Length == 0)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return Task.CompletedTask;
        }

        if (counter.Increment(key) > Limit)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.Headers["Retry-After"] = "60";
            return Task.CompletedTask;
        }

        return next(context);
    }
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
