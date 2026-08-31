// d05_di_patterns / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.AspNetCore.Mvc;

namespace DotnetDojo.Api.D05_DiPatterns;

public interface IRepository<T>
{
    string Describe();
}

public sealed class InMemoryRepository<T> : IRepository<T>
{
    public string Describe() => typeof(T).Name;
}

public record Widget(string Name);

public record Gadget(string Name);

public record RepoResponse(string Widget, string Gadget, bool SameInstance);

public class Ex4Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped(typeof(IRepository<>), typeof(InMemoryRepository<>));
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/repos", Get);
    }

    private static IResult Get(
        [FromServices] IRepository<Widget> widgets,
        [FromServices] IRepository<Gadget> gadgets,
        [FromServices] IRepository<Widget> widgetsAgain) =>
        TypedResults.Ok(new RepoResponse(
            widgets.Describe(), gadgets.Describe(), ReferenceEquals(widgets, widgetsAgain)));
}
