// 02_dependency_injection / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L02_DependencyInjection;

public interface ITicketSource
{
    Guid Ticket { get; }
}

public sealed class TicketSource : ITicketSource
{
    public Guid Ticket { get; } = Guid.NewGuid();
}

public interface IIdGenerator
{
    Guid Value { get; }
}

public sealed class IdGenerator : IIdGenerator
{
    public Guid Value { get; } = Guid.NewGuid();
}

public record TicketResponse(Guid Ticket, Guid First, Guid Second);

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<ITicketSource, TicketSource>();
        services.AddTransient<IIdGenerator, IdGenerator>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/ticket", GetTicket);
    }

    private static IResult GetTicket(ITicketSource source, IIdGenerator first, IIdGenerator second) =>
        TypedResults.Ok(new TicketResponse(source.Ticket, first.Value, second.Value));
}
