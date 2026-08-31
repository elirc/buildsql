// d04_di_lifetimes / ex7 - a singleton that needs to know about this request.
// See lessons/d04_di_lifetimes/README.md, "Exercise 7".

namespace DotnetDojo.Api.D04_DiLifetimes;

public interface IRequestReporter
{
    string Describe();
}

public sealed class RequestReporter : IRequestReporter
{
    // TODO ex7: report the X-Trace header of the request being handled right
    // now, or "none" when there is not one. The class stays a singleton.
    public string Describe() => "unknown";
}

public record AmbientResponse(string Trace);

public class Ex7Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex7: one more registration is needed here.
        services.AddSingleton<IRequestReporter, RequestReporter>();
    }
}

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/ambient", Get);
    }

    // Given: the handler never touches HttpContext. The reporter does.
    private static IResult Get(IRequestReporter reporter) =>
        TypedResults.Ok(new AmbientResponse(reporter.Describe()));
}
