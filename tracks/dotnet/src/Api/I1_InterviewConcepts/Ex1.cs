// i1_interview_concepts / ex1 - "fix the captive dependency".
// See lessons/i1_interview_concepts/README.md, "Exercise 1".

namespace DotnetDojo.Api.I1_InterviewConcepts;

public interface IRequestId
{
    Guid Value { get; }
}

public sealed class RequestId : IRequestId
{
    public Guid Value { get; } = Guid.NewGuid();
}

public interface IJobRunner
{
    Guid CurrentRequest { get; }

    int Run();
}

public sealed class JobRunner : IJobRunner
{
    private readonly IRequestId _requestId;
    private int _runs;

    public JobRunner(IRequestId requestId) => _requestId = requestId;

    public Guid CurrentRequest => _requestId.Value;

    public int Run() => Interlocked.Increment(ref _runs);
}

public record JobResponse(Guid RequestId, Guid Echo, int TotalRuns);

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddTransient<IRequestId, RequestId>();
        services.AddSingleton<IJobRunner, JobRunner>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i1/jobs", RunJob);
    }

    private static IResult RunJob(IJobRunner runner, IRequestId echo) =>
        TypedResults.Ok(new JobResponse(runner.CurrentRequest, echo.Value, runner.Run()));
}
