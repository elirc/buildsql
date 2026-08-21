// i1_interview_concepts / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I1_InterviewConcepts;

public interface IRequestId
{
    Guid Value { get; }
}

public sealed class RequestId : IRequestId
{
    public Guid Value { get; } = Guid.NewGuid();
}

public record JobRun(Guid RequestId, int TotalRuns);

public interface IJobRunner
{
    JobRun Run(IRequestId requestId);
}

public sealed class JobRunner : IJobRunner
{
    private int _runs;

    public JobRun Run(IRequestId requestId) =>
        new(requestId.Value, Interlocked.Increment(ref _runs));
}

public record JobResponse(Guid RequestId, Guid Echo, int TotalRuns);

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IRequestId, RequestId>();
        services.AddSingleton<IJobRunner, JobRunner>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i1/jobs", RunJob);
    }

    private static IResult RunJob(IJobRunner runner, IRequestId requestId, IRequestId echo)
    {
        var run = runner.Run(requestId);
        return TypedResults.Ok(new JobResponse(run.RequestId, echo.Value, run.TotalRuns));
    }
}
