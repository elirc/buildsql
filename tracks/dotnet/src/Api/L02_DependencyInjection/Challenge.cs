// 02_dependency_injection / challenge - the captive dependency.
// See lessons/02_dependency_injection/README.md, "Challenge".

namespace DotnetDojo.Api.L02_DependencyInjection;

public interface IRequestToken
{
    Guid Value { get; }
}

public sealed class RequestToken : IRequestToken
{
    public Guid Value { get; } = Guid.NewGuid();
}

/// <summary>Counts every dispatch the application has ever made, and reports
/// the token of the request it is dispatching right now.</summary>
public interface IDispatcher
{
    Guid Token { get; }

    int Dispatch();
}

public sealed class Dispatcher : IDispatcher
{
    private readonly IRequestToken _token;
    private int _handled;

    public Dispatcher(IRequestToken token) => _token = token;

    public Guid Token => _token.Value;

    public int Dispatch() => Interlocked.Increment(ref _handled);
}

public record DispatchResponse(Guid Token, Guid Echo, int Handled);

public class ChallengeServices : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddTransient<IRequestToken, RequestToken>();
        services.AddSingleton<IDispatcher, Dispatcher>();
    }
}

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/dispatch", Dispatch);
    }

    // 200 with {"token": <the token the dispatcher is working on>,
    //           "echo":  <the token the container gave this handler>,
    //           "handled": <how many dispatches the app has made in total>}.
    private static IResult Dispatch(IDispatcher dispatcher, IRequestToken token, IRequestToken echo) =>
        TypedResults.Ok(new DispatchResponse(dispatcher.Token, echo.Value, dispatcher.Dispatch()));
}
