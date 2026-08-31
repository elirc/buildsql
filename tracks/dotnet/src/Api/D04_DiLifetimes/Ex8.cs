// d04_di_lifetimes / ex8 - four registrations, four different answers.
// See lessons/d04_di_lifetimes/README.md, "Exercise 8".

namespace DotnetDojo.Api.D04_DiLifetimes;

public interface IBuildTally
{
    int Count { get; }

    void Built();
}

public sealed class BuildTally : IBuildTally
{
    private int _count;

    public int Count => Volatile.Read(ref _count);

    public void Built() => Interlocked.Increment(ref _count);
}

/// <summary>Expensive to construct. The application should only ever pay once.</summary>
public interface IParser
{
    string Name { get; }
}

public sealed class Parser : IParser
{
    public Parser(IBuildTally tally) => tally.Built();

    public string Name => "parser";
}

/// <summary>Everything one request puts in it, and nothing from any other.</summary>
public interface IBasket
{
    Guid Id { get; }
}

public sealed class Basket : IBasket
{
    public Guid Id { get; } = Guid.NewGuid();
}

/// <summary>Never reused. Two tickets are never the same ticket.</summary>
public interface ITicket
{
    Guid Id { get; }
}

public sealed class Ticket : ITicket
{
    public Guid Id { get; } = Guid.NewGuid();
}

/// <summary>How many requests this application has handled since it started.</summary>
public interface IHandledTally
{
    int Next();
}

public sealed class HandledTally : IHandledTally
{
    private int _count;

    public int Next() => Interlocked.Increment(ref _count);
}

public record AuditResponse(
    string Parser, int ParserBuilds, Guid BasketA, Guid BasketB,
    Guid TicketA, Guid TicketB, int Handled);

public class Ex8Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // Given: the build tally counts parser constructions. Leave it.
        services.AddSingleton<IBuildTally, BuildTally>();

        // TODO ex8: all four of these are wrong. The doc comment on each
        // interface says what it is for; the README says what the gate checks.
        services.AddTransient<IParser, Parser>();
        services.AddTransient<IBasket, Basket>();
        services.AddSingleton<ITicket, Ticket>();
        services.AddScoped<IHandledTally, HandledTally>();
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/audit", Get);
    }

    // Given: resolves everything twice where twice is interesting.
    private static IResult Get(
        IParser parser,
        IBuildTally builds,
        IBasket basketA,
        IBasket basketB,
        ITicket ticketA,
        ITicket ticketB,
        IHandledTally handled) =>
        TypedResults.Ok(new AuditResponse(
            parser.Name, builds.Count, basketA.Id, basketB.Id,
            ticketA.Id, ticketB.Id, handled.Next()));
}
