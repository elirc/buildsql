// d04_di_lifetimes / ex8 - reference solution (author only, used by `dojo verify`).

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

public interface IParser
{
    string Name { get; }
}

public sealed class Parser : IParser
{
    public Parser(IBuildTally tally) => tally.Built();

    public string Name => "parser";
}

public interface IBasket
{
    Guid Id { get; }
}

public sealed class Basket : IBasket
{
    public Guid Id { get; } = Guid.NewGuid();
}

public interface ITicket
{
    Guid Id { get; }
}

public sealed class Ticket : ITicket
{
    public Guid Id { get; } = Guid.NewGuid();
}

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
        services.AddSingleton<IBuildTally, BuildTally>();

        services.AddSingleton<IParser, Parser>();
        services.AddScoped<IBasket, Basket>();
        services.AddTransient<ITicket, Ticket>();
        services.AddSingleton<IHandledTally, HandledTally>();
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d04/audit", Get);
    }

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
