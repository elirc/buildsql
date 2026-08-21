// i3_interview_rapidfire / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I3_InterviewRapidfire;

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAppWide, AppWide>();
        services.AddScoped<IPerRequest, PerRequest>();
        services.AddTransient<IPerCall, PerCall>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i3/lifetimes", Lifetimes);
    }

    private static IResult Lifetimes(
        IAppWide app,
        IPerRequest request1,
        IPerRequest request2,
        IPerCall call1,
        IPerCall call2) =>
        TypedResults.Ok(new LifetimeResponse(
            app.Value, request1.Value, request2.Value, call1.Value, call2.Value));
}
