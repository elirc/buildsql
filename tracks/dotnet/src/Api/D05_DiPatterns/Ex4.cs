// d05_di_patterns / ex4 - one registration for every closed type.
// See lessons/d05_di_patterns/README.md, "Exercise 4".

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
        // TODO ex4: ONE registration that covers IRepository<Widget>,
        // IRepository<Gadget> and every other closed form nobody has thought
        // of yet. One instance per request.
        services.AddScoped<IRepository<Widget>, InMemoryRepository<Widget>>();
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/repos", Get);
    }

    // Given: asks for two different closed forms, and one of them twice.
    // [FromServices] is explicit on purpose - without it, a type the container
    // does not know about is inferred as a request BODY, and a GET endpoint
    // with an inferred body fails at startup rather than at request time.
    private static IResult Get(
        [FromServices] IRepository<Widget> widgets,
        [FromServices] IRepository<Gadget> gadgets,
        [FromServices] IRepository<Widget> widgetsAgain) =>
        TypedResults.Ok(new RepoResponse(
            widgets.Describe(), gadgets.Describe(), ReferenceEquals(widgets, widgetsAgain)));
}
