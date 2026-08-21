// i3_interview_rapidfire / ex1 - lifetimes, cold.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 1".

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex1: three interfaces, three lifetimes, one each. The names say
        // which is which.
        services.AddTransient<IAppWide, AppWide>();
        services.AddTransient<IPerRequest, PerRequest>();
        services.AddTransient<IPerCall, PerCall>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i3/lifetimes", Lifetimes);
    }

    // Given code: resolves each service twice and reports what it got.
    private static IResult Lifetimes(
        IAppWide app,
        IPerRequest request1,
        IPerRequest request2,
        IPerCall call1,
        IPerCall call2) =>
        TypedResults.Ok(new LifetimeResponse(
            app.Value, request1.Value, request2.Value, call1.Value, call2.Value));
}
