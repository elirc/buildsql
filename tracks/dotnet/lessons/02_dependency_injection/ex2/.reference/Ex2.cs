// 02_dependency_injection / ex2 - reference solution (author only, used by `dojo verify`).

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
        services.AddScoped<IRequestScope, RequestScope>();
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/scope", GetScope);
    }

    private static IResult GetScope(IRequestScope first, IRequestScope second) =>
        TypedResults.Ok(new ScopeResponse(first.Id, second.Id));
}
