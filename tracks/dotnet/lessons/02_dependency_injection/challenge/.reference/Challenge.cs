// 02_dependency_injection / challenge - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L02_DependencyInjection;

public interface IRequestToken
{
    Guid Value { get; }
}

public sealed class RequestToken : IRequestToken
{
    public Guid Value { get; } = Guid.NewGuid();
}

public record Dispatched(Guid Token, int Handled);

public interface IDispatcher
{
    Dispatched Dispatch(IRequestToken token);
}

public sealed class Dispatcher : IDispatcher
{
    private int _handled;

    public Dispatched Dispatch(IRequestToken token) =>
        new(token.Value, Interlocked.Increment(ref _handled));
}

public record DispatchResponse(Guid Token, Guid Echo, int Handled);

public class ChallengeServices : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IRequestToken, RequestToken>();
        services.AddSingleton<IDispatcher, Dispatcher>();
    }
}

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/dispatch", Dispatch);
    }

    private static IResult Dispatch(IDispatcher dispatcher, IRequestToken token, IRequestToken echo)
    {
        var dispatched = dispatcher.Dispatch(token);
        return TypedResults.Ok(new DispatchResponse(dispatched.Token, echo.Value, dispatched.Handled));
    }
}
