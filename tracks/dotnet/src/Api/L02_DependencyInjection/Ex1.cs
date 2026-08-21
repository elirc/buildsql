// 02_dependency_injection / ex1 - singleton and transient, told apart.
// See lessons/02_dependency_injection/README.md, "Exercise 1".

namespace DotnetDojo.Api.L02_DependencyInjection;

/// <summary>One value that the whole application shares.</summary>
public interface ITicketSource
{
    Guid Ticket { get; }
}

public sealed class TicketSource : ITicketSource
{
    public Guid Ticket { get; } = Guid.NewGuid();
}

/// <summary>A fresh value every single time you ask for one.</summary>
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
        // TODO ex1: one of these two lifetimes is wrong. Read the gate.
        services.AddTransient<ITicketSource, TicketSource>();
        services.AddTransient<IIdGenerator, IdGenerator>();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l02/ticket", GetTicket);
    }

    // 200 with {"ticket": …, "first": …, "second": …} taken from the three
    // services the container hands you.
    private static IResult GetTicket(ITicketSource source, IIdGenerator first, IIdGenerator second) =>
        throw new NotImplementedException("ex1: GET /l02/ticket is not implemented yet - edit src/Api/L02_DependencyInjection/Ex1.cs");
}
