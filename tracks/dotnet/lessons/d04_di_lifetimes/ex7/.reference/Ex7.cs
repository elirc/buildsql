// d04_di_lifetimes / ex7 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D04_DiLifetimes;

public interface IRequestReporter
{
    string Describe();
}

public sealed class RequestReporter(IHttpContextAccessor accessor) : IRequestReporter
{
    public string Describe()
    {
        var http = accessor.HttpContext;

        if (http is null)
        {
            return "none";
        }

        string trace = http.Request.Headers["X-Trace"].ToString();

        return string.IsNullOrWhiteSpace(trace) ? "none" : trace;
    }
}

public record AmbientResponse(string Trace);

public class Ex7Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddSingleton<IRequestReporter, RequestReporter>();
    }
}

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/ambient", Get);
    }

    private static IResult Get(IRequestReporter reporter) =>
        TypedResults.Ok(new AmbientResponse(reporter.Describe()));
}
