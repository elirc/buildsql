// d04_di_lifetimes / ex6 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D04_DiLifetimes;

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
        services.AddScoped<IWorkUnit, WorkUnit>();

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

    private static IResult Get(IWorkUnit unit, IPeopleRepo people, IOrdersRepo orders) =>
        TypedResults.Ok(new WorkUnitResponse(unit.Id, people.UnitId, orders.UnitId));
}
