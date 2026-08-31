// d04_di_lifetimes / ex6 - why a unit of work is scoped.
// See lessons/d04_di_lifetimes/README.md, "Exercise 6".

namespace DotnetDojo.Api.D04_DiLifetimes;

/// <summary>The unit of work every collaborator in one request must share.</summary>
public interface IWorkUnit
{
    Guid Id { get; }
}

public sealed class WorkUnit : IWorkUnit
{
    public Guid Id { get; } = Guid.NewGuid();
}

public interface IPeopleRepo
{
    Guid UnitId { get; }
}

public sealed class PeopleRepo(IWorkUnit unit) : IPeopleRepo
{
    public Guid UnitId => unit.Id;
}

public interface IOrdersRepo
{
    Guid UnitId { get; }
}

public sealed class OrdersRepo(IWorkUnit unit) : IOrdersRepo
{
    public Guid UnitId => unit.Id;
}

public record WorkUnitResponse(Guid Handler, Guid People, Guid Orders);

public class Ex6Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex6: one lifetime makes both repositories and the handler share
        // a single unit of work for the length of one request.
        services.AddTransient<IWorkUnit, WorkUnit>();

        // Given: leave these two alone.
        services.AddScoped<IPeopleRepo, PeopleRepo>();
        services.AddScoped<IOrdersRepo, OrdersRepo>();
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/unit", Get);
    }

    // Given: reports the unit the handler got, and the one each repository has.
    private static IResult Get(IWorkUnit unit, IPeopleRepo people, IOrdersRepo orders) =>
        TypedResults.Ok(new WorkUnitResponse(unit.Id, people.UnitId, orders.UnitId));
}
