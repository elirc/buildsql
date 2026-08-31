// d05_di_patterns / ex8 - decorate a registration you did not write.
// See lessons/d05_di_patterns/README.md, "Exercise 8".

namespace DotnetDojo.Api.D05_DiPatterns;

public interface IGreetCounter
{
    int Count { get; }

    void Add();
}

public sealed class GreetCounter : IGreetCounter
{
    private int _count;

    public int Count => Volatile.Read(ref _count);

    public void Add() => Interlocked.Increment(ref _count);
}

public interface IGreetingService
{
    string Greet(string name);

    string Describe();
}

public sealed class GreetingService : IGreetingService
{
    public string Greet(string name) => $"hello {name}";

    public string Describe() => "core";
}

public sealed class ShoutingGreeting(IGreetingService inner) : IGreetingService
{
    public string Greet(string name) => inner.Greet(name).ToUpperInvariant();

    public string Describe() => "shouting>" + inner.Describe();
}

public sealed class CountingGreeting(IGreetingService inner, IGreetCounter counter) : IGreetingService
{
    public string Greet(string name)
    {
        counter.Add();

        return inner.Greet(name);
    }

    public string Describe() => "counting>" + inner.Describe();
}

public record GreetResponse(string Greeting, int Greeted, string Chain);

public class Ex8Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IGreetCounter, GreetCounter>();

        // Given: another module registered the core implementation. Pretend you
        // cannot edit this line and do not know which class it names.
        services.AddSingleton<IGreetingService, GreetingService>();

        // TODO ex8: wrap whatever is registered above in ShoutingGreeting, and
        // then wrap that in CountingGreeting.
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d05/greet/{name}", Get);
    }

    // Given: greets once and reports the chain it went through.
    private static IResult Get(IGreetingService greetings, IGreetCounter counter, string name) =>
        TypedResults.Ok(new GreetResponse(
            greetings.Greet(name), counter.Count, greetings.Describe()));
}
