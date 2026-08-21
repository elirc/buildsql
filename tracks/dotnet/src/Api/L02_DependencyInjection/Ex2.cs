// 02_dependency_injection / ex2 - scoped: one per request, and only per request.
// See lessons/02_dependency_injection/README.md, "Exercise 2".

namespace DotnetDojo.Api.L02_DependencyInjection;

public interface IRequestScope
{
    Guid Id { get; }
}

public sealed class RequestScope : IRequestScope
{
    public Guid Id { get; } = Guid.NewGuid();
}

public record ScopeResponse(Guid First, Guid Second);

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex2: this lifetime cannot satisfy the gate. Which one can?
        services.AddTransient<IRequestScope, RequestScope>();
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/scope", GetScope);
    }

    // 200 with {"first": …, "second": …} - both parameters are resolved
    // separately by the container, on purpose.
    private static IResult GetScope(IRequestScope first, IRequestScope second) =>
        throw new NotImplementedException("ex2: GET /l02/scope is not implemented yet - edit src/Api/L02_DependencyInjection/Ex2.cs");
}
